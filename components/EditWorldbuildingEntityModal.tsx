
import React, { useState, useEffect } from 'react';
import { Novel } from '../types';

interface EditWorldbuildingEntityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entity: any) => void;
    entity: any;
    entityType: string;
    novel: Novel;
}

const commonInputClass = "w-full p-2 bg-primary border border-slate-300 rounded-lg text-text-primary focus:ring-2 focus:ring-accent transition-colors";
const commonTextareaClass = `${commonInputClass} h-24`;
const commonLabelClass = "text-sm font-medium text-text-secondary capitalize";

const EditWorldbuildingEntityModal: React.FC<EditWorldbuildingEntityModalProps> = ({ isOpen, onClose, onSave, entity, entityType, novel }) => {
    const [formData, setFormData] = useState(entity);

    useEffect(() => {
        setFormData(entity);
    }, [entity, isOpen]);

    if (!isOpen) return null;

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };
    
    const handleMultiSelectChange = (field: string, selectedOptions: HTMLCollectionOf<HTMLOptionElement>) => {
        const values = Array.from(selectedOptions, (option: HTMLOptionElement) => option.value);
        handleChange(field, values);
    };

    const renderFields = () => {
        const fields = Object.keys(formData).filter(key => key !== 'id');
        
        return fields.map(key => {
            const value = formData[key];
            const label = key.replace(/([A-Z])/g, ' $1').trim();
            
            // Special handling for relationship fields
            if (key === 'rival_factions') {
                return (
                    <div key={key}>
                        <label className={commonLabelClass}>{label}</label>
                        <select multiple value={value || []} onChange={e => handleMultiSelectChange(key, e.target.selectedOptions)} className={`${commonInputClass} h-24`}>
                            {novel.factions.filter(f => f.id !== entity.id).map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                        </select>
                    </div>
                );
            }

            if (Array.isArray(value)) {
                 return (
                    <div key={key}>
                        <label className={commonLabelClass}>{label}</label>
                        <textarea value={value.join(', ')} onChange={e => handleChange(key, e.target.value.split(',').map(s => s.trim()))} className={commonTextareaClass} />
                        <p className="text-xs text-slate-500 mt-1">Enter values separated by commas.</p>
                    </div>
                );
            }

            if (typeof value === 'string' && (value.length > 60 || key.includes('description') || key.includes('summary') || key.includes('goals') || key.includes('text'))) {
                 return (
                    <div key={key}>
                        <label className={commonLabelClass}>{label}</label>
                        <textarea value={value} onChange={e => handleChange(key, e.target.value)} className={commonTextareaClass} />
                    </div>
                );
            }
            
            return (
                 <div key={key}>
                    <label className={commonLabelClass}>{label}</label>
                    <input type="text" value={value} onChange={e => handleChange(key, e.target.value)} className={commonInputClass} />
                </div>
            );
        });
    };

    const entityTypeName = entityType.replace(/([A-Z])/g, ' $1').slice(0, -1).trim();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-secondary rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-4 capitalize">Edit {entity.name || entityTypeName}</h2>
                <div className="space-y-4">
                    {renderFields()}
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-text-primary hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={() => onSave(formData)} className="bg-accent hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">Save</button>
                </div>
            </div>
        </div>
    );
};

export default EditWorldbuildingEntityModal;
