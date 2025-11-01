'use client';

import { useApp } from '@/context/AppContext';
import RichTextEditor from './RichTextEditor';
import { Save, Calendar, Clock, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PageEditor() {
  const { state, dispatch } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isModified, setIsModified] = useState(false);

  // Find current page
  const currentPage = state.notebooks
    .flatMap(notebook => notebook.sections)
    .flatMap(section => section.pages)
    .find(page => page.id === state.selectedPage);

  useEffect(() => {
    if (currentPage) {
      setTitle(currentPage.title);
      setContent(currentPage.content);
      setIsModified(false);
    }
  }, [currentPage]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setIsModified(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsModified(true);
  };

  const handleSave = () => {
    if (currentPage && isModified) {
      dispatch({
        type: 'UPDATE_PAGE',
        payload: {
          pageId: currentPage.id,
          content,
          title,
        },
      });
      setIsModified(false);
    }
  };

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (isModified) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [content, title, isModified]);

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-gray-500">
          <FileText size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-medium mb-2">Selecione uma página</h2>
          <p>Escolha uma página existente ou crie uma nova para começar a editar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-2xl font-bold text-gray-800 border-none outline-none bg-transparent flex-1 mr-4"
            placeholder="Título da página"
          />
          <div className="flex items-center space-x-4">
            {isModified && (
              <button
                onClick={handleSave}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Save size={16} className="mr-1" />
                Salvar
              </button>
            )}
            <div className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-1" />
              {new Date(currentPage.updatedAt).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-400">
          <Calendar size={16} className="mr-1" />
          Criado em {new Date(currentPage.createdAt).toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 overflow-y-auto">
        <RichTextEditor
          content={content}
          onUpdate={handleContentChange}
        />
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            {isModified ? 'Modificado' : 'Salvo'}
          </span>
          <span>
            {content.replace(/<[^>]*>/g, '').length} caracteres
          </span>
        </div>
      </div>
    </div>
  );
}