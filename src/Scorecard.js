import React from 'react';

const Scorecard = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border-t-4 border-blue-600">
      <div className="p-4 bg-gray-50 flex justify-between">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">{data.matchName}</span>
        <span className="text-sm text-red-500 font-bold">● LIVE</span>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold">{data.teamA}</div>
          <div className="text-2xl font-black">{data.scoreA}/{data.wicketsA} <span className="text-sm font-normal">({data.oversA})</span></div>
        </div>
        <div className="flex justify-between items-center text-gray-400 italic">vs</div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-xl font-bold">{data.teamB}</div>
          <div className="text-2xl font-black">{data.scoreB}/{data.wicketsB} <span className="text-sm font-normal">({data.oversB})</span></div>
        </div>
      </div>
      <div className="bg-blue-900 text-white p-2 text-center text-xs font-medium uppercase">
        {data.status || "Match in Progress"}
      </div>
    </div>
  );
};

export default Scorecard;