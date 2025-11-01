'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Book, 
  FolderOpen, 
  FileText, 
  Plus, 
  Search, 
  MoreHorizontal,
  Trash2,
  Edit
} from 'lucide-react';
import { Notebook, Section, Page } from '@/types';

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set(['1']));

  const toggleNotebook = (notebookId: string) => {
    const newExpanded = new Set(expandedNotebooks);
    if (newExpanded.has(notebookId)) {
      newExpanded.delete(notebookId);
    } else {
      newExpanded.add(notebookId);
    }
    setExpandedNotebooks(newExpanded);
  };

  const createNewNotebook = () => {
    const newNotebook: Notebook = {
      id: Date.now().toString(),
      name: 'Novo Notebook',
      color: '#4F46E5',
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_NOTEBOOK', payload: newNotebook });
  };

  const createNewSection = (notebookId: string) => {
    const newSection: Section = {
      id: `${notebookId}-${Date.now()}`,
      name: 'Nova Seção',
      notebookId,
      pages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_SECTION', payload: { notebookId, section: newSection } });
  };

  const createNewPage = (sectionId: string) => {
    const newPage: Page = {
      id: `${sectionId}-${Date.now()}`,
      title: 'Nova Página',
      content: '<h1>Nova Página</h1><p>Comece a escrever aqui...</p>',
      sectionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_PAGE', payload: { sectionId, page: newPage } });
    dispatch({ type: 'SELECT_PAGE', payload: newPage.id });
  };

  const filteredNotebooks = state.notebooks.filter(notebook =>
    notebook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notebook.sections.some(section =>
      section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.pages.some(page =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  );

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">OneNote Clone</h1>
          <button
            onClick={createNewNotebook}
            className="p-2 hover:bg-gray-200 rounded-lg"
            title="Novo Notebook"
          >
            <Plus size={20} />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredNotebooks.map((notebook) => (
          <div key={notebook.id} className="mb-2">
            {/* Notebook */}
            <div
              className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 cursor-pointer ${
                state.selectedNotebook === notebook.id ? 'bg-blue-100' : ''
              }`}
              onClick={() => {
                dispatch({ type: 'SELECT_NOTEBOOK', payload: notebook.id });
                toggleNotebook(notebook.id);
              }}
            >
              <div className="flex items-center">
                <Book size={16} style={{ color: notebook.color }} className="mr-2" />
                <span className="text-sm font-medium truncate">{notebook.name}</span>
              </div>
              <div className="flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createNewSection(notebook.id);
                  }}
                  className="p-1 hover:bg-gray-300 rounded"
                  title="Nova Seção"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Sections */}
            {expandedNotebooks.has(notebook.id) && (
              <div className="ml-4 mt-1">
                {notebook.sections.map((section) => (
                  <div key={section.id} className="mb-1">
                    <div
                      className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 cursor-pointer ${
                        state.selectedSection === section.id ? 'bg-blue-100' : ''
                      }`}
                      onClick={() => dispatch({ type: 'SELECT_SECTION', payload: section.id })}
                    >
                      <div className="flex items-center">
                        <FolderOpen size={14} className="mr-2 text-gray-600" />
                        <span className="text-sm truncate">{section.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          createNewPage(section.id);
                        }}
                        className="p-1 hover:bg-gray-300 rounded"
                        title="Nova Página"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Pages */}
                    <div className="ml-4 mt-1">
                      {section.pages.map((page) => (
                        <div
                          key={page.id}
                          className={`flex items-center p-2 rounded-lg hover:bg-gray-200 cursor-pointer ${
                            state.selectedPage === page.id ? 'bg-blue-200' : ''
                          }`}
                          onClick={() => dispatch({ type: 'SELECT_PAGE', payload: page.id })}
                        >
                          <FileText size={12} className="mr-2 text-gray-500" />
                          <span className="text-xs truncate">{page.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}