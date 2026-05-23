import { useState, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { ChevronRight, ArrowLeft, ChevronDown } from 'lucide-react';

const getIconComponent = (iconName) => {
  if (!iconName) return LucideIcons.Folder;
  const Icon = LucideIcons[iconName];
  return Icon ? Icon : LucideIcons.Folder;
};

export default function CategoryPicker({ categories, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeParent, setActiveParent] = useState(null);
  const pickerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find selected category name for display
  let selectedName = 'Оберіть категорію';
  if (value && categories) {
    for (const root of categories) {
      if (String(root.id) === String(value)) {
        selectedName = root.name;
        break;
      }
      const child = root.children?.find(c => String(c.id) === String(value));
      if (child) {
        selectedName = child.name;
        break;
      }
    }
  }

  const handleParentClick = (parent) => {
    if (parent.children && parent.children.length > 0) {
      setActiveParent(parent);
    } else {
      // Leaf node selected
      onChange(parent.id);
      setIsOpen(false);
    }
  };

  const handleSubClick = (subId) => {
    onChange(subId);
    setIsOpen(false);
    setActiveParent(null); // Reset for next time
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveParent(null); // Reset state when opening
    }
  };

  return (
    <div className="relative w-full" ref={pickerRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-left flex justify-between items-center transition-all"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {selectedName}
        </span>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 w-full max-w-sm bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          
          {/* PARENT SELECTION VIEW */}
          {!activeParent && (
            <div className="max-h-96 overflow-y-auto py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Головні категорії
              </div>
              {categories.map(cat => {
                const Icon = getIconComponent(cat.icon_name);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleParentClick(cat)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-indigo-50 group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cat.color || 'bg-gray-100 text-gray-600'} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-indigo-700">{cat.name}</span>
                    </div>
                    {cat.children && cat.children.length > 0 && (
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* SUB CATEGORY SELECTION VIEW */}
          {activeParent && (
            <div className="flex flex-col max-h-96">
              <div className="flex items-center p-4 border-b border-gray-100 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setActiveParent(null)}
                  className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 transition-colors mr-3"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="font-semibold text-gray-800">{activeParent.name}</div>
              </div>
              
              <div className="overflow-y-auto py-2">
                <button
                  type="button"
                  onClick={() => handleSubClick(activeParent.id)}
                  className="w-full px-5 py-3 text-left font-medium text-indigo-600 hover:bg-indigo-50 transition-colors border-b border-gray-50"
                >
                  Всі в {activeParent.name}
                </button>
                {activeParent.children?.map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSubClick(sub.id)}
                    className="w-full px-5 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-indigo-700 transition-colors"
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
