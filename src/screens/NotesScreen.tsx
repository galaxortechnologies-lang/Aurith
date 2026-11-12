import React, { useState } from 'react';
import { ScreenId, NoteItem } from '../types';
import { ArrowLeft, Plus, Trash2, Edit3, Save, X, FileEdit } from 'lucide-react';
import { getStoredNotes, saveNotes } from '../services/storage';

interface NotesScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const NotesScreen: React.FC<NotesScreenProps> = ({ onNavigate }) => {
  const [notes, setNotes] = useState<NoteItem[]>(getStoredNotes());
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSaveNote = () => {
    if (!title.trim() && !content.trim()) return;

    if (editingId) {
      const updated = notes.map((n) =>
        n.id === editingId ? { ...n, title: title.trim() || 'Untitled Note', content: content.trim(), updatedAt: Date.now() } : n
      );
      setNotes(updated);
      saveNotes(updated);
      setEditingId(null);
    } else {
      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        updatedAt: Date.now(),
      };
      const updated = [newNote, ...notes];
      setNotes(updated);
      saveNotes(updated);
      setIsCreating(false);
    }

    setTitle('');
    setContent('');
  };

  const handleDelete = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  const handleEdit = (note: NoteItem) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setIsCreating(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#040812] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-[#081224] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-heading">Smart Notes</h2>
            <p className="text-[11px] text-slate-400">Stored locally in Room SQLite database</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setTitle('');
            setContent('');
            setIsCreating(!isCreating);
          }}
          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 text-slate-950 flex items-center gap-1 transition"
        >
          {isCreating ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {isCreating ? 'Cancel' : 'New Note'}
        </button>
      </div>

      <div className="p-4 overflow-y-auto space-y-3 flex-1">
        {/* Editor Form */}
        {isCreating && (
          <div className="p-4 rounded-2xl bg-[#09152B] border border-cyan-500/40 space-y-3 animate-in fade-in">
            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              {editingId ? 'Edit Note' : 'Create New Note'}
            </h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full bg-[#040812] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Note details, thoughts, or dictated notes in Hindi/English..."
              rows={4}
              className="w-full bg-[#040812] border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                Save Note
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-2.5">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 rounded-xl bg-[#081429] border border-slate-800 hover:border-cyan-500/30 transition space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition">
                  {note.title}
                </h4>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-1 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800"
                    title="Edit Note"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-red-950/30"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
              <div className="text-[10px] text-slate-500 font-mono">
                Updated {new Date(note.updatedAt).toLocaleString()}
              </div>
            </div>
          ))}

          {notes.length === 0 && (
            <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <FileEdit className="w-8 h-8 text-slate-600" />
              <span>No notes saved yet. Create your first note above or ask AURITH!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
