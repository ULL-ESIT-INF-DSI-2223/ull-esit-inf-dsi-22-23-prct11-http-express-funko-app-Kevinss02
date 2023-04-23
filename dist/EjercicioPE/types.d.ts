export type Command = {
    title: string;
    output: string;
};
export type ResponseType = {
    type: 'add' | 'remove' | 'read' | 'list';
    success: boolean;
    command: Command | undefined;
};
