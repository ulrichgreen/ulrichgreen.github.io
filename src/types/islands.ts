export interface RegisterIslandInput {
    name: string;
    props: Record<string, unknown>;
}

export interface SerializedIsland extends RegisterIslandInput {
    id: string;
}
