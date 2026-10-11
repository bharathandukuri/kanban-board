import type { Container } from "@/types/types";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import KanbanContainerItem from "./kanban-container-item";

function KanbanContainer({
    container,
    deleteContainer,
    editContainer,
    addItem,
    deleteItem,
    editItem,
}: {
    container: Container;
    deleteContainer: (id: string) => void;
    editContainer: (id: string, name: string) => void;
    addItem: (containerId: string) => void;
    deleteItem: (itemId: string, containerId: string) => void;
    editItem: (itemId: string, containerId: string, content: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: container.id,
        data: {
            type: "container",
            id: container.id,
            container: container,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const itemIds = useMemo(
        () => container.items.map((i) => i.id),
        [container.items],
    );

    const [editMode, setEditMode] = useState(false);

    if (isDragging) {
        if (editMode) setEditMode(false);
        return (
            <div
                className="w-[250px] h-[350px] p-0 border-border border-2 rounded-xl overflow-hidden bg-transparent flex flex-col"
                ref={setNodeRef}
                style={style}
            />
        );
    }

    return (
        <div
            className="w-[250px] h-[350px] p-0 border-border border-2 rounded-xl overflow-hidden bg-card flex flex-col"
            ref={setNodeRef}
            style={style}
        >
            <div
                className={cn(
                    "bg-background py-1 px-2 text-sm font-bold flex items-center justify-between border-border border-b",
                    editMode ? "py-2" : "",
                )}
                {...attributes}
                {...listeners}
            >
                <span
                    onClick={() => {
                        if (!isDragging) setEditMode(true);
                    }}
                    className="cursor-default"
                >
                    {editMode ? (
                        <Input
                            autoFocus
                            value={container.name}
                            onChange={(e) =>
                                editContainer(container.id, e.target.value)
                            }
                            placeholder="Container name"
                            className="shadow-none border-b text-sm md:text-sm"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    if (e.currentTarget.value === "") {
                                        editContainer(
                                            container.id,
                                            "New Container",
                                        );
                                    }
                                    setEditMode(false);
                                }
                            }}
                            onBlur={(e) => {
                                if (e.target.value === "") {
                                    editContainer(
                                        container.id,
                                        "New Container",
                                    );
                                }
                            }}
                        />
                    ) : (
                        container.name
                    )}
                </span>
                <Button
                    variant={"ghost"}
                    className="text-destructive"
                    onClick={() => deleteContainer(container.id)}
                    size={"sm"}
                >
                    <Trash2 />
                </Button>
            </div>
            <div className="grow flex flex-col gap-2 p-1 overflow-auto overflow-x-hidden">
                <SortableContext items={itemIds}>
                    {container.items.map((item) => (
                        <KanbanContainerItem
                            editItem={editItem}
                            item={item}
                            deleteItem={deleteItem}
                            container={container}
                            key={item.id}
                        />
                    ))}
                </SortableContext>
            </div>

            <Button
                className="w-full rounded-none rounded-b-xl"
                onClick={() => {
                    addItem(container.id);
                }}
            >
                Add Item
            </Button>
        </div>
    );
}
export default KanbanContainer;
