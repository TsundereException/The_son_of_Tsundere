import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Search, MapPin } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import apiClient from '../api/client';

export default function CatalogFilters({ onFilterChange }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || '';

  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search);
    const initial = {
      category: params.get('category') || '',
      subcategory: '',
      min_price: params.get('min_price') || '',
      max_price: params.get('max_price') || '',
      has_photo: params.get('has_photo') === 'true',
      attributes: {},
      tab: 'all'
    };
    
    for (const [key, value] of params.entries()) {
      if (key.startsWith('attr_') && value) {
        if (key.endsWith('_min')) {
          const slug = key.replace('attr_', '').replace('_min', '');
          if (!initial.attributes[slug]) initial.attributes[slug] = {};
          initial.attributes[slug].min = value;
        } else if (key.endsWith('_max')) {
          const slug = key.replace('attr_', '').replace('_max', '');
          if (!initial.attributes[slug]) initial.attributes[slug] = {};
          initial.attributes[slug].max = value;
        } else {
          const slug = key.replace('attr_', '');
          initial.attributes[slug] = value.split(',');
        }
      }
    }
    return initial;
  };

  const [localFilters, setLocalFilters] = useState(getInitialFilters());

  const [isUrlParsed, setIsUrlParsed] = useState(false);
  const lastParsedSearch = useRef(location.search);

  // Track open dropdown
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const dropdownRef = useRef(null);

  const { data: config, isLoading, isFetching } = useQuery({
    queryKey: ['filters-config', localFilters.category],
    queryFn: async () => {
      const response = await apiClient.get('/products/filters-config/', {
        params: localFilters.category ? { category: localFilters.category } : {}
      });
      return response.data;
    },
    keepPreviousData: true,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Parse URL category once config is loaded OR when URL actually changes
  useEffect(() => {
    if (config?.categories && (!isUrlParsed || lastParsedSearch.current !== location.search)) {
      const urlCategoryId = queryParams.get('category');
      
      if (urlCategoryId) {
        // Is it a root category?
        const isRoot = config.categories.some(c => String(c.id) === urlCategoryId);
        if (isRoot) {
          setLocalFilters(prev => ({ ...prev, category: urlCategoryId, subcategory: '' }));
        } else {
          // Is it a subcategory?
          for (const root of config.categories) {
            const foundSub = root.children?.find(c => String(c.id) === urlCategoryId);
            if (foundSub) {
              setLocalFilters(prev => ({ ...prev, category: String(root.id), subcategory: urlCategoryId }));
              break;
            }
          }
        }
      } else if (lastParsedSearch.current !== location.search) {
        // If we navigated to a URL without category, clear it
        setLocalFilters(prev => ({ ...prev, category: '', subcategory: '' }));
      }
      setIsUrlParsed(true);
      lastParsedSearch.current = location.search;
    }
  }, [config, isUrlParsed, location.search, queryParams]);

  // Update parent when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(localFilters);
    }
  }, [localFilters, onFilterChange]);

  if (isLoading) {
    return <div className="w-full p-5 animate-pulse bg-gray-100 rounded-xl h-24 mb-6"></div>;
  }

  const { categories = [], attributes = [] } = config || {};

  // Get active category children if a category is selected
  const activeCategory = categories.find(c => String(c.id) === localFilters.category);
  const subcategories = activeCategory?.children || [];

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleCategorySelect = (categoryId) => {
    setLocalFilters(prev => ({ ...prev, category: categoryId, subcategory: '', attributes: {} }));
    setOpenDropdown(null);
  };

  const handleSubcategorySelect = (subcategoryId) => {
    setLocalFilters(prev => ({ ...prev, subcategory: subcategoryId, attributes: {} }));
    setOpenDropdown(null);
  };

  const toggleAttribute = (attrSlug, value) => {
    setLocalFilters(prev => {
      const currentValues = prev.attributes[attrSlug] || [];
      let newValues;
      if (currentValues.includes(value)) {
        newValues = currentValues.filter(v => v !== value);
      } else {
        newValues = [...currentValues, value];
      }
      
      const newAttributes = { ...prev.attributes };
      if (newValues.length > 0) {
        newAttributes[attrSlug] = newValues;
      } else {
        delete newAttributes[attrSlug];
      }
      
      return { ...prev, attributes: newAttributes };
    });
  };

  const clearFilters = () => {
    setLocalFilters({
      category: '',
      subcategory: '',
      min_price: '',
      max_price: '',
      has_photo: false,
      attributes: {},
      tab: 'all'
    });
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col">
      {/* Top Search Bar (Optional depending on global layout, but included for OLX look) */}
      <div className="flex flex-col md:flex-row border-b border-gray-100 p-2 gap-2">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Пошук..." 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="md:w-1/3 relative border-l md:border-gray-200 pl-2">
          <MapPin className="w-5 h-5 absolute left-4 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Уся Україна" 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="bg-gray-900 text-white font-medium px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
          Пошук <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Checkboxes row */}
      <div className="flex items-center gap-6 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-gray-700">
          <input 
            type="checkbox" 
            checked={localFilters.has_photo || false}
            onChange={(e) => setLocalFilters({ ...localFilters, has_photo: e.target.checked })}
            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
          />
          <span>Тільки з фото</span>
        </label>
      </div>

      {/* Main Dropdown Filters Row */}
      <div className="p-6" ref={dropdownRef}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Фільтри</h2>
        
        <div className="flex flex-wrap gap-4">
          
          {/* Category Mega Menu */}
          <div className="relative">
            <label className="block text-xs text-gray-500 mb-1">Категорія</label>
            <button 
              onClick={() => {
                toggleDropdown('category');
                setHoveredCategory(null);
              }}
              className="flex items-center justify-between w-64 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none"
            >
              <span className="truncate">
                {localFilters.subcategory 
                  ? (subcategories.find(c => String(c.id) === localFilters.subcategory)?.name || 'Всі категорії')
                  : (activeCategory ? activeCategory.name : 'Всі категорії')}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
            </button>
            {openDropdown === 'category' && (() => {
              const currentCat = hoveredCategory || activeCategory;
              const hasSubcats = currentCat?.children?.length > 0;
              
              return (
              <div className={`absolute z-20 top-full mt-2 bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl flex text-sm overflow-hidden ring-1 ring-black/5 transition-all duration-300 ${
                hasSubcats ? 'w-[650px]' : 'w-[325px]'
              }`}>
                {/* Left Column */}
                <div className={`${hasSubcats ? 'w-1/2 border-r border-gray-100' : 'w-full'} p-2 max-h-[400px] overflow-y-auto custom-scrollbar`}>
                  <div 
                    className="px-3 py-2.5 mb-1 rounded-xl hover:bg-gray-50 cursor-pointer flex justify-between items-center text-gray-700 font-medium transition-colors"
                    onClick={() => {
                       handleCategorySelect('');
                       setHoveredCategory(null);
                    }}
                    onMouseEnter={() => setHoveredCategory(null)}
                  >
                    <span>Будь-яка категорія</span>
                  </div>
                  {categories.map(cat => {
                    const isHighlighted = hoveredCategory ? hoveredCategory.id === cat.id : localFilters.category === String(cat.id);
                    return (
                      <div 
                        key={cat.id} 
                        className={`px-3 py-2.5 mb-1 cursor-pointer flex justify-between items-center rounded-xl transition-all duration-300 ${
                          isHighlighted 
                            ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md font-semibold' 
                            : 'hover:bg-indigo-50/60 text-gray-700 font-medium'
                        }`}
                        onClick={() => handleCategorySelect(String(cat.id))}
                        onMouseEnter={() => setHoveredCategory(cat)}
                      >
                        <span>{cat.name}</span>
                        <div className="flex items-center gap-2">
                          {cat.product_count !== undefined && (
                            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                              isHighlighted 
                                ? 'bg-white/20 text-white border border-white/20' 
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {cat.product_count}
                            </span>
                          )}
                          {cat.children?.length > 0 && (
                            <ChevronDown className="w-4 h-4 -rotate-90 opacity-70" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Right Column */}
                {hasSubcats && (
                  <div className="w-1/2 p-2 bg-gradient-to-br from-gray-50/50 to-indigo-50/30 max-h-[400px] overflow-y-auto custom-scrollbar">
                    <div 
                      className="px-4 py-3 cursor-pointer font-bold bg-gradient-to-r from-indigo-100/50 to-violet-100/50 text-indigo-900 border border-indigo-100/50 rounded-xl mb-2 flex justify-between items-center shadow-sm"
                      onClick={() => handleCategorySelect(String(currentCat.id))}
                    >
                      <span>Все в {currentCat.name}</span>
                      {currentCat.product_count !== undefined && (
                        <span className="text-[11px] bg-white text-indigo-700 px-2 py-0.5 rounded-full shadow-sm font-bold border border-indigo-100">
                          {currentCat.product_count}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {currentCat.children.map(sub => (
                        <div 
                          key={sub.id} 
                          className={`px-3 py-2 cursor-pointer flex justify-between items-center rounded-lg transition-colors ${
                            localFilters.subcategory === String(sub.id) 
                              ? 'bg-indigo-100/50 font-semibold text-indigo-900' 
                              : 'hover:bg-white hover:shadow-sm text-gray-700 font-medium'
                          }`}
                          onClick={() => {
                            setLocalFilters(prev => ({ ...prev, category: String(currentCat.id), subcategory: String(sub.id), attributes: {} }));
                            setOpenDropdown(null);
                          }}
                        >
                          <span className="pr-2">{sub.name}</span>
                          {sub.product_count !== undefined && (
                            <span className="text-[11px] bg-white border border-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full shrink-0 shadow-sm">
                              {sub.product_count}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );})()}
          </div>

          {/* Price Range Dropdown */}
          <div className="relative">
            <label className="block text-xs text-gray-500 mb-1">Ціна</label>
            <button 
              onClick={() => toggleDropdown('price')}
              className="flex items-center justify-between w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none"
            >
              <span className="truncate">
                {localFilters.min_price || localFilters.max_price 
                  ? `${localFilters.min_price || 0} - ${localFilters.max_price || '...'} ₴` 
                  : 'Від - До'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
            </button>
            {openDropdown === 'price' && (
              <div className="absolute z-10 top-full mt-1 w-64 p-4 bg-white border border-gray-200 rounded-lg shadow-lg flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Від" 
                  value={localFilters.min_price}
                  onChange={(e) => setLocalFilters({...localFilters, min_price: e.target.value})}
                  className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="number" 
                  placeholder="До" 
                  value={localFilters.max_price}
                  onChange={(e) => setLocalFilters({...localFilters, max_price: e.target.value})}
                  className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Dynamic Attributes */}
          {attributes.map(attr => (
             <div key={attr.id} className="relative">
               <label className="block text-xs text-gray-500 mb-1">{attr.name}</label>
               
               {attr.type !== 'range' && attr.options && attr.options.length <= 5 ? (
                 <div className="flex flex-wrap gap-2">
                   {attr.options.map(opt => {
                     const isSelected = (localFilters.attributes[attr.slug] || []).includes(opt.value);
                     return (
                       <button
                         key={opt.id}
                         type="button"
                         onClick={() => toggleAttribute(attr.slug, opt.value)}
                         className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                           isSelected 
                             ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm' 
                             : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50/30'
                         }`}
                       >
                         {opt.value}
                       </button>
                     );
                   })}
                 </div>
               ) : (
                 <>
                   <button 
                     onClick={() => toggleDropdown(`attr_${attr.slug}`)}
                     className="flex items-center justify-between w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none"
                   >
                     <span className="truncate">
                        {attr.type === 'range' 
                          ? (localFilters.attributes[attr.slug]?.min || localFilters.attributes[attr.slug]?.max 
                              ? `${localFilters.attributes[attr.slug]?.min || ''} - ${localFilters.attributes[attr.slug]?.max || '...'}` 
                              : 'Від: - До:')
                          : ((localFilters.attributes[attr.slug] && localFilters.attributes[attr.slug].length > 0)
                              ? `${localFilters.attributes[attr.slug].length} обрано`
                              : 'Всі оголошення')}
                     </span>
                     <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
                   </button>
                   {openDropdown === `attr_${attr.slug}` && (
                     <div className={`absolute z-10 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg ${attr.type === 'range' ? 'w-64 p-4 flex items-center gap-2' : 'w-48 max-h-60 overflow-y-auto py-2'}`}>
                       {attr.type === 'range' ? (
                         <>
                            <input 
                              type="number" 
                              placeholder="Від" 
                              value={localFilters.attributes[attr.slug]?.min || ''}
                              onChange={(e) => {
                                const newAttrs = {...localFilters.attributes};
                                if (!newAttrs[attr.slug]) newAttrs[attr.slug] = {};
                                newAttrs[attr.slug].min = e.target.value;
                                setLocalFilters({...localFilters, attributes: newAttrs});
                              }}
                              className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-gray-400">-</span>
                            <input 
                              type="number" 
                              placeholder="До" 
                              value={localFilters.attributes[attr.slug]?.max || ''}
                              onChange={(e) => {
                                const newAttrs = {...localFilters.attributes};
                                if (!newAttrs[attr.slug]) newAttrs[attr.slug] = {};
                                newAttrs[attr.slug].max = e.target.value;
                                setLocalFilters({...localFilters, attributes: newAttrs});
                              }}
                              className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                         </>
                       ) : (
                         <>
                           {attr.options.map(opt => (
                             <label 
                               key={opt.id} 
                               className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm ${(localFilters.attributes[attr.slug] || []).includes(opt.value) ? 'bg-indigo-50/30' : ''}`}
                             >
                               <input 
                                 type="checkbox"
                                 checked={(localFilters.attributes[attr.slug] || []).includes(opt.value)}
                                 onChange={() => toggleAttribute(attr.slug, opt.value)}
                                 className="rounded text-indigo-600 focus:ring-indigo-500"
                               />
                               {opt.value}
                             </label>
                           ))}
                         </>
                       )}
                     </div>
                   )}
                 </>
               )}
             </div>
          ))}

        </div>

        {/* Tabs: Vsi / Biznes / Privatni */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200">
          <div className="flex gap-6">
            <button 
              onClick={() => setLocalFilters({...localFilters, tab: 'all'})}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${localFilters.tab === 'all' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Всі оголошення
            </button>
            <button 
              onClick={() => setLocalFilters({...localFilters, tab: 'business'})}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${localFilters.tab === 'business' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Бізнес
            </button>
            <button 
              onClick={() => setLocalFilters({...localFilters, tab: 'private'})}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${localFilters.tab === 'private' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Приватні
            </button>
          </div>
          <button 
            onClick={clearFilters}
            className="py-3 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mt-2 md:mt-0"
          >
            Скинути фільтри
          </button>
        </div>

      </div>
    </div>
  );
}
