import React, { useState } from 'react';
import { db } from './firebase';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';

const AdminPanel = ({ matchId }) => {
  const [playerName, setPlayerName] = useState("");

  const addPlayer = async () => {
    if (!playerName) return;
    const matchRef = doc(db, "matches", matchId);
    await updateDoc(matchRef, {
      battingStats: arrayUnion({ name: playerName, runs: 0, balls: 0, fours: 0, sixes: 0 })
    });
    setPlayerName("");
  };

  // Logic to update the total team score
  const updateTeam = async (field, value) => {
    const matchRef = doc(db, "matches", matchId);
    await updateDoc(matchRef, { [field]: increment(value) });
  };

  return (
    <div className="p-4 bg-slate-900 text-white rounded-xl mt-6 space-y-4">
      <div className="flex gap-2">
        <input value={playerName} onChange={(e) => setPlayerName(e.target.value)}
          className="flex-1 p-2 rounded bg-slate-800 text-sm" placeholder="Add Batter Name" />
        <button onClick={addPlayer} className="bg-green-600 px-4 rounded text-xs font-bold">ADD</button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 4, 6].map(run => (
          <button key={run} onClick={() => updateTeam('Score-A', run)} 
            className="bg-blue-600 p-2 rounded font-black">+{run}</button>
        ))}
      </div>
      <p className="text-[10px] text-gray-500 text-center uppercase">Updating Total Team Score</p>
    </div>
  );
};

export default AdminPanel;