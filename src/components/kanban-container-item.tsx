import type { Container, Item } from "@/types/types";
import { useState } from "react";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { Input } from "./ui/input";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function KanbanContainerItem({
    container,
    item,
    deleteItem,
    editItem,
}: {
    container: Container;
    item: Item;
    deleteItem: (itemId: string, containerId: string) => void;
    editItem: (itemId: string, containerId: string, content: string) => void;
}) {
    const [focus, setFocus] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
        data: {
            type: "item",
            itemId: item.id,
            containerId: container.id,
            item: item,
            container: container,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    if (isDragging) {
        if (editMode) setEditMode(false);
        return (
            <div
                className="border border-border p-2 rounded-sm text-xs flex items-center justify-between opacity-25"
                onMouseEnter={() => setFocus(true)}
                onMouseLeave={() => setFocus(false)}
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
            />
        );
    }

    return (
        <div
            className="relative border border-border p-2 rounded-sm text-xs flex items-center justify-between"
            onMouseEnter={() => setFocus(true)}
            onMouseLeave={() => setFocus(false)}
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            <span
                className="pr-6 w-full"
                onClick={() => {
                    if (!isDragging) setEditMode(true);
                }}
            >
                {editMode ? (
                    <Input
                        autoFocus
                        value={item.content}
                        className="h-6 text-xs md:text-xs   "
                        onChange={(e) =>
                            editItem(item.id, container.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                if (e.currentTarget.value === "") {
                                    editItem(item.id, container.id, "New Item");
                                }
                                setEditMode(false);
                            }
                        }}
                        onBlur={(e) => {
                            if (e.target.value === "") {
                                editItem(item.id, container.id, "New Item");
                            }
                            setEditMode(false);
                        }}
                    />
                ) : (
                    item.content
                )}
            </span>

            <Button
                className={`absolute right-1 top-1/2 -translate-y-1/2 text-destructive p-0 m-0 transition-opacity ${
                    focus ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                variant="ghost"
                size="xs"
                onClick={() => {
                    deleteItem(item.id, container.id);
                }}
            >
                <Trash2 />
            </Button>
        </div>
    );
}

export default KanbanContainerItem;
