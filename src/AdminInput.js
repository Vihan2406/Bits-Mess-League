import React, { useState } from 'react';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

const AdminInput = ({ matchId }) => {
  const [score, setScore] = useState(0);

  const updateScore = async () => {
    const matchRef = doc(db, "matches", matchId);
    await updateDoc(matchRef, {
      scoreA: Number(score), // Updates the score in the cloud
      status: "Team A is batting well!"
    });
    alert("Score Updated!");
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg mt-4">
      <h3 className="font-bold mb-2">Admin Panel</h3>
      <input 
        type="number" 
        onChange={(e) => setScore(e.target.value)}
        className="text-black p-1 rounded mr-2" 
        placeholder="New Score"
      />
      <button onClick={updateScore} className="bg-green-600 px-4 py-1 rounded">
        Update
      </button>
    </div>
  );
};

export default AdminInput;