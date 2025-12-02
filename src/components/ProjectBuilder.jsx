import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import GlassCard from './GlassCard';
import { Plus, Save, FolderOpen, Trash2, AlertCircle } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const EmptyBudgetState = ({ setTotalLumpSum }) => (
    <GlassCard className="p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="bg-indigo-100 p-4 rounded-full mb-4">
            <AlertCircle size={48} className="text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Start Your Budget</h3>
        <p className="text-slate-500 mb-6 max-w-xs">
            Enter an income amount to start planning your project allocations.
        </p>
        <div className="relative w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
                type="number"
                placeholder="1000"
                onChange={(e) => setTotalLumpSum(Number(e.target.value))}
                className="pl-7 pr-4 py-3 w-full rounded-xl bg-white/50 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg text-slate-800 text-center shadow-sm"
                autoFocus
            />
        </div>
    </GlassCard>
);

const ProjectBuilder = () => {
    const [totalLumpSum, setTotalLumpSum] = useState(10000);
    const [sections, setSections] = useState([]);
    const [newSection, setNewSection] = useState({ name: '', amount: '' });
    const [projects, setProjects] = useState([]);
    const [projectName, setProjectName] = useState('');

    // Load projects from localStorage on mount
    useEffect(() => {
        const savedProjects = localStorage.getItem('frugal_projects');
        if (savedProjects) {
            setProjects(JSON.parse(savedProjects));
        }
    }, []);

    const handleAddSection = () => {
        if (!newSection.name || !newSection.amount) return;
        setSections([...sections, { ...newSection, amount: Number(newSection.amount) }]);
        setNewSection({ name: '', amount: '' });
    };

    const handleRemoveSection = (index) => {
        const newSections = [...sections];
        newSections.splice(index, 1);
        setSections(newSections);
    };

    const handleSaveProject = () => {
        if (!projectName) return;
        const project = {
            name: projectName,
            totalLumpSum,
            sections,
            date: new Date().toISOString()
        };
        const newProjects = [...projects, project];
        setProjects(newProjects);
        localStorage.setItem('frugal_projects', JSON.stringify(newProjects));
        setProjectName('');
        alert('Project saved!');
    };

    const handleLoadProject = (project) => {
        setTotalLumpSum(project.totalLumpSum);
        setSections(project.sections);
        setProjectName(project.name); // Optional: keep name to overwrite?
    };

    if (!totalLumpSum || totalLumpSum <= 0) {
        return <EmptyBudgetState setTotalLumpSum={setTotalLumpSum} />;
    }

    const totalAllocated = sections.reduce((sum, item) => sum + item.amount, 0);
    const remaining = totalLumpSum - totalAllocated;

    // Ensure we don't pass negative values to the pie chart
    const safeRemaining = Math.max(0, remaining);

    const data = [
        ...sections.map(s => ({ name: s.name, value: s.amount })),
        { name: 'Remaining', value: safeRemaining }
    ];

    const remainingColor = remaining < 0 ? '#EF4444' : '#E5E7EB'; // Red if over, Gray if under

    return (
        <div className="space-y-6">
            <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Project Settings</h3>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm text-slate-500 mb-1">Total Lump Sum</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                            <input
                                type="number"
                                value={totalLumpSum}
                                onChange={(e) => setTotalLumpSum(Number(e.target.value))}
                                className="pl-7 pr-4 py-2 w-full rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg text-slate-800"
                            />
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {sections.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <Cell key="cell-remaining" fill={remainingColor} />
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-xs text-slate-500">Remaining</p>
                    <p className={`text-xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-slate-700'}`}>
                        ${remaining.toLocaleString()}
                    </p>
                </div>
            </div>

            <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Allocations</h3>

                <div className="flex gap-2 mb-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Name (e.g. Housing)"
                            value={newSection.name}
                            onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            list="presets"
                        />
                        <datalist id="presets">
                            <option value="Housing" />
                            <option value="Investment" />
                            <option value="Food" />
                            <option value="Tax" />
                            <option value="Debt" />
                        </datalist>
                    </div>
                    <div className="w-32">
                        <input
                            type="number"
                            placeholder="Amount"
                            value={newSection.amount}
                            onChange={(e) => setNewSection({ ...newSection, amount: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        onClick={handleAddSection}
                        className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {sections.map((section, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white/40 rounded-lg">
                            <span className="font-medium text-slate-700">{section.name}</span>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-800">${section.amount.toLocaleString()}</span>
                                <button onClick={() => handleRemoveSection(index)} className="text-red-400 hover:text-red-600">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {sections.length === 0 && (
                        <p className="text-center text-slate-400 text-sm py-2">No allocations yet.</p>
                    )}
                </div>
            </GlassCard>

            <GlassCard className="p-6">
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        onClick={handleSaveProject}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                        <Save size={18} />
                        Save
                    </button>
                </div>

                {projects.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-sm text-slate-500 mb-2">Load Project</p>
                        <div className="flex flex-wrap gap-2">
                            {projects.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleLoadProject(p)}
                                    className="px-3 py-1 text-sm bg-white/40 hover:bg-white/60 rounded-full text-slate-700 transition-colors border border-white/20"
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default ProjectBuilder;
