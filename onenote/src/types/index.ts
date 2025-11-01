export interface Notebook {
  id: string;
  name: string;
  color: string;
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  name: string;
  notebookId: string;
  pages: Page[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  id: string;
  title: string;
  content: string;
  sectionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  notebooks: Notebook[];
  selectedNotebook: string | null;
  selectedSection: string | null;
  selectedPage: string | null;
  searchQuery: string;
}