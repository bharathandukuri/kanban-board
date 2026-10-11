export interface Item {
    id: string;
    content: string;
}

export interface Container {
    id: string;
    name: string;

    items: Item[];
}
