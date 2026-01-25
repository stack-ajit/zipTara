import { MapPin, Clock, DollarSign, FileText, Trash2, Edit2 } from 'lucide-react';

const StopItem = ({ stop, onDelete, onEdit, readOnly }) => {
    return (
        <div className="relative pl-6 pb-6 ml-2 border-l-2 border-indigo-100 last:border-0 last:pb-0">
            {/* Timeline Dot */}
            <div className="absolute top-0 left-[-9px] w-4 h-4 rounded-full bg-white border-4 border-indigo-500" />

            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="flex items-center space-x-2 text-indigo-600 text-sm font-bold mb-1">
                            <Clock className="w-3 h-3" />
                            <span>{stop.time}</span>
                        </div>
                        <h4 className="text-base font-bold text-gray-900 leading-tight">{stop.title}</h4>
                    </div>

                    {!readOnly && (
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-lg">
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                {stop.desc && (
                    <p className="text-gray-600 text-sm mb-3">{stop.desc}</p>
                )}

                <div className="flex flex-wrap gap-2">
                    {stop.cost > 0 && (
                        <span className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <DollarSign className="w-3 h-3" />
                            <span>{stop.cost}</span>
                        </span>
                    )}

                    {stop.notes && (
                        <span className="inline-flex items-center space-x-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md max-w-full truncate">
                            <FileText className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{stop.notes}</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StopItem;
