import React, { useState } from 'react';
import { 
  RadialBarChart, RadialBar, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, ReferenceLine, ReferenceArea
} from 'recharts';
import { FullReport, ExposureLevel, SkillClass } from '../types';

interface Props {
  report: FullReport;
}

const COLORS: Record<string, string> = {
  E0: '#94a3b8', // slate-400
  E1: '#ef4444', // red-500
  E2: '#f59e0b', // amber-500
  E3: '#6366f1', // indigo-500
  
  S0: '#94a3b8',
  S1: '#22c55e', // green-500
  S2: '#3b82f6', // blue-500
  S3: '#ef4444', // red-500
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // Check if it's the main role node or a task node
    const isMainRole = data.z === 10; 

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg max-w-xs">
        {isMainRole ? (
           <>
            <p className="font-bold text-slate-800 border-b pb-1 mb-1">Overall Role</p>
            <p className="text-xs text-slate-600">Automation: {Math.round(data.x)}</p>
            <p className="text-xs text-slate-600">Augmentation: {Math.round(data.y)}</p>
           </>
        ) : (
          <>
            <p className="font-bold text-slate-800 border-b pb-1 mb-1 text-xs">{data.description}</p>
            <div className="flex gap-2 mt-1">
               <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{data.exposureLevel}</span>
               <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">Aug: {data.augmentationPotential}</span>
            </div>
            <p className="text-[10px] text-slate-500 italic mt-1">{data.rationale}</p>
          </>
        )}
      </div>
    );
  }
  return null;
};

const KPITooltip = ({ title, content }: { title: string, content: string }) => (
  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl z-50 pointer-events-none">
    <div className="font-bold mb-1 text-indigo-300 border-b border-slate-700 pb-1">{title}</div>
    <div className="leading-relaxed text-slate-300">{content}</div>
    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
  </div>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Dashboard: React.FC<Props> = ({ report }) => {
  const [taskFilter, setTaskFilter] = useState<string>('ALL');
  const [skillFilter, setSkillFilter] = useState<string>('ALL');

  // Prepare Task Data for Donut
  const taskCounts = report.tasks.reduce((acc, task) => {
    acc[task.exposureLevel] = (acc[task.exposureLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const taskData = [
    { name: 'No Exposure (E0)', value: taskCounts[ExposureLevel.E0] || 0, color: COLORS.E0 },
    { name: 'Direct LLM (E1)', value: taskCounts[ExposureLevel.E1] || 0, color: COLORS.E1 },
    { name: 'App-Based (E2)', value: taskCounts[ExposureLevel.E2] || 0, color: COLORS.E2 },
    { name: 'Multimodal (E3)', value: taskCounts[ExposureLevel.E3] || 0, color: COLORS.E3 },
  ].filter(d => d.value > 0);

  // Prepare Skill Data for Stacked Bar
  const skillCounts = report.skills.reduce((acc, skill) => {
    acc[skill.classification] = (acc[skill.classification] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Quadrant Data
  // 1. The aggregate role point
  const roleData = [{ x: report.automationScore, y: report.augmentationScore, z: 10, type: 'Role' }];
  
  // 2. Individual task points
  const taskPoints = report.tasks.map(t => ({
    x: t.x,
    y: t.y,
    z: 1, // smaller bubble size
    description: t.description,
    exposureLevel: t.exposureLevel,
    augmentationPotential: t.augmentationPotential,
    rationale: t.rationale,
    color: COLORS[t.exposureLevel]
  }));

  // Filter Data for Tables
  const filteredTasks = report.tasks.filter(t => taskFilter === 'ALL' || t.exposureLevel === taskFilter);
  const filteredSkills = report.skills.filter(s => skillFilter === 'ALL' || s.classification === skillFilter);

  const TASK_FILTERS = ['ALL', 'E0', 'E1', 'E2', 'E3'];
  const SKILL_FILTERS = ['ALL', 'S0', 'S1', 'S2', 'S3'];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Transferability Index Card */}
        <div className="group relative bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-help hover:border-indigo-300 transition-colors">
          <KPITooltip 
            title="Transferability Index" 
            content="A composite score indicating the overall urgency for transformation. Calculated as (Automation Score * 0.6) + (Augmentation Score * 0.4). High scores imply a fundamental shift in the role's nature." 
          />
          <div className="flex items-center gap-1 mb-1">
            <p className="text-sm text-slate-500">Transferability Index</p>
            <InfoIcon />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-800">{report.transferabilityIndex}</h3>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${report.transferabilityIndex}%` }}
            ></div>
          </div>
        </div>

        {/* Automation Score Card */}
        <div className="group relative bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-help hover:border-indigo-300 transition-colors">
          <KPITooltip 
            title="Automation Score" 
            content="Percentage of task load susceptible to direct AI automation. Weighted calculation where E1 (Direct LLM) tasks contribute 100%, E2 (App-based) 50%, and E3 (Multimodal) 30%." 
          />
          <div className="flex items-center gap-1 mb-1">
            <p className="text-sm text-slate-500">Automation Score</p>
            <InfoIcon />
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{report.automationScore}</h3>
          <p className="text-xs text-slate-400 mt-2">Potential for task automation</p>
        </div>

        {/* Augmentation Score Card */}
        <div className="group relative bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-help hover:border-indigo-300 transition-colors">
          <KPITooltip 
            title="Augmentation Score" 
            content="Measures the potential for Human-AI synergy. A high score indicates a diverse role where humans manage AI outputs (Human-in-the-loop) rather than doing the raw execution manually." 
          />
          <div className="flex items-center gap-1 mb-1">
            <p className="text-sm text-slate-500">Augmentation Score</p>
            <InfoIcon />
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{report.augmentationScore}</h3>
          <p className="text-xs text-slate-400 mt-2">Human-AI synergy potential</p>
        </div>
        
        {/* AI Readiness Card */}
        <div className="group relative bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-help hover:border-indigo-300 transition-colors">
          <KPITooltip 
            title="AI Readiness" 
            content="Indicates if the required skill set aligns with an AI-native workflow. Weighted: S1 (AI-Relevant) skills contribute 100%, S2 (Complemented) skills contribute 50%." 
          />
          <div className="flex items-center gap-1 mb-1">
            <p className="text-sm text-slate-500">AI Readiness</p>
            <InfoIcon />
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{report.aiReadinessScore}%</h3>
          <p className="text-xs text-slate-400 mt-2">Skill readiness for adoption</p>
        </div>

        {/* Risk Category Card */}
        <div className={`group relative p-6 rounded-xl shadow-sm border cursor-help transition-colors ${
          report.riskCategory === 'Critical' ? 'border-red-200 bg-red-50 hover:border-red-300' :
          report.riskCategory === 'High' ? 'border-orange-200 bg-orange-50 hover:border-orange-300' :
          report.riskCategory === 'Medium' ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-300' :
          'border-green-200 bg-green-50 hover:border-green-300'
        }`}>
          <KPITooltip 
            title="Risk Category" 
            content="Strategic classification based on the Automation (X) vs. Augmentation (Y) quadrant. Determines if the role faces Displacement (High Auto/Low Aug) or Transformation (High Auto/High Aug)." 
          />
          <div className="flex items-center gap-1 mb-1">
             <p className="text-sm text-slate-500">Risk Category</p>
             <InfoIcon />
          </div>
          <h3 className={`text-2xl font-bold ${
             report.riskCategory === 'Critical' ? 'text-red-700' :
             report.riskCategory === 'High' ? 'text-orange-700' :
             report.riskCategory === 'Medium' ? 'text-yellow-700' :
             'text-green-700'
          }`}>{report.riskCategory}</h3>
           <p className="text-xs opacity-75 mt-2 capitalize">{report.quadrant.label}</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Task Exposure Distribution (Donut) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Task Exposure Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quadrant (Scatter Cloud) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
             <div>
               <h3 className="text-lg font-semibold text-slate-800">Role Morphology</h3>
               <p className="text-xs text-slate-500">Visualizing the "shape" of the role via task distribution</p>
             </div>
             <div className="flex flex-col gap-1 text-[10px] text-right text-slate-400">
                <div className="flex items-center justify-end gap-1"><span className="w-2 h-2 rounded-full bg-slate-900"></span> Role Aggregate</div>
                <div className="flex items-center justify-end gap-1"><span className="w-2 h-2 rounded-full bg-slate-400 opacity-50"></span> Individual Tasks</div>
             </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                <XAxis type="number" dataKey="x" name="Automation" unit="" domain={[0, 100]} label={{ value: 'Automation Potential', position: 'bottom', offset: 0, fontSize: 10 }} />
                <YAxis type="number" dataKey="y" name="Augmentation" unit="" domain={[0, 100]} label={{ value: 'Augmentation Potential', angle: -90, position: 'left', offset: 0, fontSize: 10 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                
                {/* Quadrant Dividers */}
                <ReferenceLine x={50} stroke="#cbd5e1" strokeDasharray="3 3" />
                <ReferenceLine y={50} stroke="#cbd5e1" strokeDasharray="3 3" />
                
                {/* Quadrant Labels (Background) */}
                <ReferenceArea x1={0} x2={50} y1={50} y2={100} fill="#ecfccb" fillOpacity={0.05} /> 
                <ReferenceArea x1={50} x2={100} y1={50} y2={100} fill="#dbeafe" fillOpacity={0.05} />
                <ReferenceArea x1={50} x2={100} y1={0} y2={50} fill="#fee2e2" fillOpacity={0.05} />
                <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill="#f1f5f9" fillOpacity={0.05} />

                {/* Individual Tasks Layer */}
                <Scatter name="Tasks" data={taskPoints} fill="#8884d8" fillOpacity={0.6}>
                  {taskPoints.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>

                {/* Main Role Aggregate Layer (on top) */}
                <Scatter name="Role" data={roleData} fill="#1e293b" shape="star" legendType='none'>
                   <Cell fill="#1e293b" />
                </Scatter>

              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Executive Summary</h3>
        <p className="text-slate-600 leading-relaxed mb-6">{report.executiveSummary}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2 text-sm uppercase tracking-wide">Role Redesign</h4>
                <ul className="list-disc list-outside ml-4 space-y-1">
                    {report.recommendations.roleRedesign.map((r, i) => (
                        <li key={i} className="text-sm text-slate-700">{r}</li>
                    ))}
                </ul>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2 text-sm uppercase tracking-wide">Reskilling</h4>
                <ul className="list-disc list-outside ml-4 space-y-1">
                    {report.recommendations.reskillingPriorities.map((r, i) => (
                        <li key={i} className="text-sm text-slate-700">{r}</li>
                    ))}
                </ul>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2 text-sm uppercase tracking-wide">Tech Integration</h4>
                <ul className="list-disc list-outside ml-4 space-y-1">
                    {report.recommendations.techIntegration.map((r, i) => (
                        <li key={i} className="text-sm text-slate-700">{r}</li>
                    ))}
                </ul>
            </div>
        </div>
      </div>

      {/* Detailed Analysis Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold text-slate-800">Task Breakdown</h3>
               <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{filteredTasks.length} Tasks</span>
            </div>
            
            {/* Task Filters */}
            <div className="flex flex-wrap gap-2">
              {TASK_FILTERS.map(filter => (
                <button
                  key={filter}
                  onClick={() => setTaskFilter(filter)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                    taskFilter === filter 
                      ? 'text-white border-transparent' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  style={{
                    backgroundColor: taskFilter === filter 
                      ? (filter === 'ALL' ? '#4f46e5' : COLORS[filter]) 
                      : undefined
                  }}
                >
                  {filter === 'ALL' ? 'All Tasks' : filter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-96 flex-grow">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3">Task</th>
                  <th className="px-6 py-3">Auto / Aug</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? filteredTasks.map((task, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{task.description}</div>
                      <div className="text-slate-500 text-xs mt-1">{task.rationale}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border w-fit ${
                          task.exposureLevel === 'E0' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                          task.exposureLevel === 'E1' ? 'bg-red-50 text-red-600 border-red-200' :
                          task.exposureLevel === 'E2' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          'bg-indigo-50 text-indigo-600 border-indigo-200'
                        }`}>
                          {task.exposureLevel}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Synergy: {task.augmentationPotential}
                        </span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-slate-400">
                      No tasks found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
             <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Skill Impact</h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{filteredSkills.length} Skills</span>
            </div>

            {/* Skill Filters */}
            <div className="flex flex-wrap gap-2">
              {SKILL_FILTERS.map(filter => (
                <button
                  key={filter}
                  onClick={() => setSkillFilter(filter)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                    skillFilter === filter 
                      ? 'text-white border-transparent' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  style={{
                    backgroundColor: skillFilter === filter 
                      ? (filter === 'ALL' ? '#4f46e5' : COLORS[filter]) 
                      : undefined
                  }}
                >
                  {filter === 'ALL' ? 'All Skills' : filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto max-h-96 flex-grow">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3">Skill</th>
                  <th className="px-6 py-3">Class</th>
                </tr>
              </thead>
              <tbody>
                {filteredSkills.length > 0 ? filteredSkills.map((skill, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{skill.name}</div>
                      <div className="text-slate-500 text-xs mt-1">{skill.rationale}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        skill.classification === 'S0' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                        skill.classification === 'S1' ? 'bg-green-50 text-green-600 border-green-200' :
                        skill.classification === 'S2' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {skill.classification}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-slate-400">
                      No skills found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;