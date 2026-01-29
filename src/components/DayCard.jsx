import { Plus, Trash2 } from 'lucide-react';
import StopItem from './StopItem';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DayCard = ({ day, index, onDeleteDay, onAddStop, onDeleteStop, onEditStop, readOnly }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    // Sorting stops by time could be added here if needed, currently assumes order is preserved or manually handled
    const sortedStops = [...day.stops].sort((a, b) => a.time.localeCompare(b.time));

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-50/50 rounded-2xl border border-gray-200 overflow-hidden mb-6"
        >
            <div className="bg-gray-100/50 p-4 flex items-center justify-between group">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center space-x-3 text-left flex-grow"
                >
                    <div className="bg-white px-3 py-1 rounded-lg font-bold text-gray-900 border border-gray-200 shadow-sm text-sm">
                        Day {index + 1}
                    </div>
                    <div>
                        {day.title && (
                            <div className="font-bold text-gray-900 text-base">{day.title}</div>
                        )}
                        <div className="font-medium text-gray-500 text-sm">
                            {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                </button>

                {!readOnly && (
                    <button
                        onClick={onDeleteDay}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove Day"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 sm:p-6">
                            {sortedStops.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                                    <p className="text-gray-400 text-sm mb-2">No stops added yet</p>
                                    {!readOnly && (
                                        <button
                                            onClick={onAddStop}
                                            className="text-indigo-600 font-medium text-sm hover:underline"
                                        >
                                            Add your first stop
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-0">
                                    {sortedStops.map((stop) => (
                                        <StopItem
                                            key={stop.id}
                                            stop={stop}
                                            onDelete={() => onDeleteStop(stop.id)}
                                            onEdit={() => onEditStop(stop)}
                                            readOnly={readOnly}
                                        />
                                    ))}
                                </div>
                            )}

                            {!readOnly && sortedStops.length > 0 && (
                                <button
                                    onClick={onAddStop}
                                    className="mt-4 w-full py-2 flex items-center justify-center space-x-2 text-sm font-medium text-gray-500 hover:text-indigo-600 hover:bg-white bg-transparent border border-transparent hover:border-indigo-100 rounded-xl transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Stop</span>
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DayCard;
