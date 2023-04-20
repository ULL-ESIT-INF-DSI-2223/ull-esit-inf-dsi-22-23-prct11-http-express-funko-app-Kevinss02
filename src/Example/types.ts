export type Color = 'green' | 'yellow' | 'blue' | 'red' | 'magenta'

export type Note = {
  title: string;
  body: string;
  color: Color;
}

export type ResponseType = {
  type: 'add' | 'remove' | 'read' | 'list';
  success: boolean;
  notes?: Note[];
}