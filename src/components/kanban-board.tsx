import { useMemo, useState } from "react";
import { Input } from "./ui/input";
import type { Container, Item } from "@/types/types";
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";
import KanbanContainer from "./kanban-container";
import {
    closestCenter,
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import KanbanContainerItem from "./kanban-container-item";

function generateId(): string {
    return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    );
}

function KanbanBoard() {
    const [name, setName] = useState("");
    const [containers, setContainers] = useState<Container[]>([]);
    const [activeContainer, setActiveContainer] = useState<Container | null>(
        null,
    );
    const [activeItem, setActiveItem] = useState<{
        item: Item;
        container: Container;
    } | null>(null);

    function addContainer() {
        let newContainers = containers;
        if (name) {
            newContainers = [
                ...newContainers,
                {
                    id: generateId(),
                    name,
                    items: [],
                },
            ];
        } else {
            newContainers = [
                ...newContainers,
                {
                    id: generateId(),
                    name: "New Container",
                    items: [],
                },
            ];
        }
        setName("");
        setContainers(newContainers);
    }

    function deleteContainer(id: string) {
        const newContainers = containers.filter(
            (container) => container.id !== id,
        );
        setContainers(newContainers);
    }

    function editContainer(id: string, name: string) {
        const newContainers = containers.map((container) => {
            if (container.id === id) {
                return {
                    ...container,
                    name,
                };
            }
            return container;
        });
        setContainers(newContainers);
    }

    function addItem(containerId: string) {
        const newContainers = containers.map((container) => {
            if (container.id === containerId) {
                return {
                    ...container,
                    items: [
                        ...container.items,
                        { id: generateId(), content: "New Item" },
                    ],
                };
            }
            return container;
        });
        setContainers(newContainers);
    }

    function deleteItem(itemId: string, containerId: string) {
        const newContainers = containers.map((container) => {
            if (container.id === containerId) {
                return {
                    ...container,
                    items: container.items.filter((item) => item.id !== itemId),
                };
            }
            return container;
        });
        setContainers(newContainers);
    }

    function editItem(itemId: string, containerId: string, content: string) {
        const newContainers = containers.map((container) => {
            if (container.id === containerId) {
                return {
                    ...container,
                    items: container.items.map((item) => {
                        if (item.id === itemId) {
                            return {
                                ...item,
                                content,
                            };
                        }
                        return item;
                    }),
                };
            }
            return container;
        });
        setContainers(newContainers);
    }

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        if (active.id && active.data.current?.type === "container") {
            setActiveContainer(active.data.current?.container);
        }
        if (active.id && active.data.current?.type === "item") {
            setActiveItem({
                item: active.data.current?.item,
                container: active.data.current?.container,
            });
        }
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        if (activeData?.type !== "item") return;

        const activeContainerId = activeData.containerId as string;
        const activeItemId = activeData.itemId as string;

        let overContainerId: string | null = null;
        let overItemId: string | null = null;

        if (overData?.type === "item") {
            overContainerId = overData.containerId;
            overItemId = overData.itemId;
        }

        if (overData?.type === "container") {
            overContainerId = over.id as string;
        }

        if (!overContainerId) return;

        setContainers((containers) => {
            const activeContainerIndex = containers.findIndex(
                (c) => c.id === activeContainerId,
            );
            const overContainerIndex = containers.findIndex(
                (c) => c.id === overContainerId,
            );

            if (activeContainerIndex === -1 || overContainerIndex === -1) {
                return containers;
            }

            const activeContainer = containers[activeContainerIndex];
            const overContainer = containers[overContainerIndex];

            const activeIndex = activeContainer.items.findIndex(
                (i) => i.id === activeItemId,
            );

            if (activeIndex === -1) return containers;

            const movingItem = activeContainer.items[activeIndex];

            if (activeContainerId === overContainerId && overItemId) {
                const overIndex = overContainer.items.findIndex(
                    (i) => i.id === overItemId,
                );

                if (activeIndex === overIndex) return containers;

                const newItems = arrayMove(
                    activeContainer.items,
                    activeIndex,
                    overIndex,
                );

                return containers.map((c) =>
                    c.id === activeContainerId ? { ...c, items: newItems } : c,
                );
            }

            if (activeContainerId !== overContainerId) {
                const overIndex = overItemId
                    ? overContainer.items.findIndex((i) => i.id === overItemId)
                    : overContainer.items.length;

                return containers.map((c) => {
                    if (c.id === activeContainerId) {
                        return {
                            ...c,
                            items: c.items.filter((i) => i.id !== activeItemId),
                        };
                    }

                    if (c.id === overContainerId) {
                        const newItems = [...c.items];
                        newItems.splice(overIndex, 0, movingItem);
                        return { ...c, items: newItems };
                    }

                    return c;
                });
            }

            return containers;
        });

        if (active.data.current) {
            active.data.current.containerId = overContainerId;
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveItem(null);
        setActiveContainer(null);
        const { active, over } = event;

        if (!over) return;
        if (active.id === over.id) return;

        if (active.data.current?.type !== "container") return;

        setContainers((containers) => {
            const oldIndex = containers.findIndex((c) => c.id === active.id);
            const newIndex = containers.findIndex((c) => c.id === over.id);

            return arrayMove(containers, oldIndex, newIndex);
        });
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
    );

    const containerIds = useMemo(
        () => containers.map((c) => c.id),
        [containers],
    );

    return (
        <div className="w-screen h-screen flex flex-col items-center p-10 overflow-x-hidden">
            <div className="p-5">
                <h1 className="text-4xl font-bold">Kanban Board</h1>
            </div>
            <div className="flex items-center justify-center gap-5 w-2xl">
                <Input
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            addContainer();
                        }
                    }}
                    value={name}
                    placeholder="Container name"
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                />
                <Button onClick={() => addContainer()}>
                    <PlusCircle /> Add Container
                </Button>
            </div>

            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                sensors={sensors}
            >
                <div className="w-full flex gap-4 flex-wrap items-center justify-center mt-20">
                    <SortableContext items={containerIds}>
                        {containers.map((container) => (
                            <KanbanContainer
                                editContainer={editContainer}
                                key={container.id}
                                container={container}
                                deleteContainer={deleteContainer}
                                addItem={addItem}
                                deleteItem={deleteItem}
                                editItem={editItem}
                            />
                        ))}
                    </SortableContext>

                    {activeContainer && (
                        <DragOverlay>
                            <KanbanContainer
                                container={activeContainer}
                                deleteContainer={deleteContainer}
                                editContainer={editContainer}
                                addItem={addItem}
                                deleteItem={deleteItem}
                                editItem={editItem}
                            />
                        </DragOverlay>
                    )}

                    {activeItem && (
                        <DragOverlay>
                            <KanbanContainerItem
                                container={activeItem.container}
                                item={activeItem.item}
                                deleteItem={deleteItem}
                                editItem={editItem}
                            />
                        </DragOverlay>
                    )}
                </div>
            </DndContext>
        </div>
    );
}
export default KanbanBoard;
