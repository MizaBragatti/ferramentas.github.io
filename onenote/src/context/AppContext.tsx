'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, Notebook, Section, Page } from '@/types';

type AppAction =
  | { type: 'ADD_NOTEBOOK'; payload: Notebook }
  | { type: 'ADD_SECTION'; payload: { notebookId: string; section: Section } }
  | { type: 'ADD_PAGE'; payload: { sectionId: string; page: Page } }
  | { type: 'UPDATE_PAGE'; payload: { pageId: string; content: string; title?: string } }
  | { type: 'SELECT_NOTEBOOK'; payload: string | null }
  | { type: 'SELECT_SECTION'; payload: string | null }
  | { type: 'SELECT_PAGE'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'DELETE_PAGE'; payload: string }
  | { type: 'DELETE_SECTION'; payload: string }
  | { type: 'DELETE_NOTEBOOK'; payload: string };

const initialState: AppState = {
  notebooks: [
    {
      id: '1',
      name: 'Meu Primeiro Notebook',
      color: '#4F46E5',
      sections: [
        {
          id: '1-1',
          name: 'Seção Geral',
          notebookId: '1',
          pages: [
            {
              id: '1-1-1',
              title: 'Página de Boas-vindas',
              content: '<h1>Bem-vindo ao OneNote Clone!</h1><p>Esta é sua primeira página. Comece a escrever suas anotações aqui.</p>',
              sectionId: '1-1',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  selectedNotebook: '1',
  selectedSection: '1-1',
  selectedPage: '1-1-1',
  searchQuery: '',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_NOTEBOOK':
      return {
        ...state,
        notebooks: [...state.notebooks, action.payload],
      };
    
    case 'ADD_SECTION':
      return {
        ...state,
        notebooks: state.notebooks.map(notebook =>
          notebook.id === action.payload.notebookId
            ? { ...notebook, sections: [...notebook.sections, action.payload.section] }
            : notebook
        ),
      };
    
    case 'ADD_PAGE':
      return {
        ...state,
        notebooks: state.notebooks.map(notebook => ({
          ...notebook,
          sections: notebook.sections.map(section =>
            section.id === action.payload.sectionId
              ? { ...section, pages: [...section.pages, action.payload.page] }
              : section
          ),
        })),
      };
    
    case 'UPDATE_PAGE':
      return {
        ...state,
        notebooks: state.notebooks.map(notebook => ({
          ...notebook,
          sections: notebook.sections.map(section => ({
            ...section,
            pages: section.pages.map(page =>
              page.id === action.payload.pageId
                ? {
                    ...page,
                    content: action.payload.content,
                    title: action.payload.title || page.title,
                    updatedAt: new Date(),
                  }
                : page
            ),
          })),
        })),
      };
    
    case 'SELECT_NOTEBOOK':
      return { ...state, selectedNotebook: action.payload };
    
    case 'SELECT_SECTION':
      return { ...state, selectedSection: action.payload };
    
    case 'SELECT_PAGE':
      return { ...state, selectedPage: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'DELETE_PAGE':
      return {
        ...state,
        notebooks: state.notebooks.map(notebook => ({
          ...notebook,
          sections: notebook.sections.map(section => ({
            ...section,
            pages: section.pages.filter(page => page.id !== action.payload),
          })),
        })),
        selectedPage: state.selectedPage === action.payload ? null : state.selectedPage,
      };
    
    case 'DELETE_SECTION':
      return {
        ...state,
        notebooks: state.notebooks.map(notebook => ({
          ...notebook,
          sections: notebook.sections.filter(section => section.id !== action.payload),
        })),
        selectedSection: state.selectedSection === action.payload ? null : state.selectedSection,
      };
    
    case 'DELETE_NOTEBOOK':
      return {
        ...state,
        notebooks: state.notebooks.filter(notebook => notebook.id !== action.payload),
        selectedNotebook: state.selectedNotebook === action.payload ? null : state.selectedNotebook,
      };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}