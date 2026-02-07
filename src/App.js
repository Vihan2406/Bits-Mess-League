import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import ScoringRoom from './ScoringRoom';

function App() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "matches"), (snapshot) => {
      setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Helper: Renders Batting Table with player-specific stats
  const BattingTable = ({ players, teamName }) => (
    <div className="mb-6">
      <h4 className="text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">{teamName} Batting</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[10px]">
          <thead className="bg-slate-100 text-slate-500 uppercase">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2 text-center">R</th>
              <th className="p-2 text-center">B</th>
              <th className="p-2 text-center">4s</th>
              <th className="p-2 text-center">6s</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => {
              const name = typeof p === 'object' ? p.name : p;
              const runs = typeof p === 'object' ? (p.runs || 0) : 0;
              const balls = typeof p === 'object' ? (p.balls || 0) : 0;
              const fours = typeof p === 'object' ? (p.fours || 0) : 0;
              const sixes = typeof p === 'object' ? (p.sixes || 0) : 0;
              return (
                <tr key={i} className="border-b border-slate-50 font-bold">
                  <td className="p-2 text-slate-700">{name || `Player ${i+1}`}</td>
                  <td className="p-2 text-center">{runs}</td>
                  <td className="p-2 text-center">{balls}</td>
                  <td className="p-2 text-center text-blue-500">{fours}</td>
                  <td className="p-2 text-center text-red-500">{sixes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Helper: Renders Bowling Table with individual over counts
  const BowlingTable = ({ players, teamName }) => (
    <div className="mb-6">
      <h4 className="text-[10px] font-black text-green-600 uppercase mb-2 tracking-widest">{teamName} Bowling</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[10px]">
          <thead className="bg-slate-100 text-slate-500 uppercase">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2 text-center">O</th>
              <th className="p-2 text-center">R</th>
              <th className="p-2 text-center">W</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => {
              const name = typeof p === 'object' ? p.name : p;
              const overs = typeof p === 'object' ? (p.overs_bowled || 0) : 0;
              const runs = typeof p === 'object' ? (p.runs_conceded || 0) : 0;
              const wickets = typeof p === 'object' ? (p.wickets || 0) : 0;
              return (
                <tr key={i} className="border-b border-slate-50 font-bold">
                  <td className="p-2 text-slate-700">{name || `Player ${i+1}`}</td>
                  <td className="p-2 text-center">{overs}</td>
                  <td className="p-2 text-center">{runs}</td>
                  <td className="p-2 text-center text-green-600">{wickets}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="min-h-screen bg-slate-50 p-4">
      <h1 className="text-3xl font-black text-center text-slate-900 mb-8 uppercase tracking-tighter">BITS Goa Mess League</h1>
      <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
        {matches.map(match => {
          // Identify Match Context based on DB keys
          const isCD = match["C-mess v/s D-mess"] !== undefined;
          const isAC = match["A mess v/s C mess"] !== undefined;
          const isAD = match["A-mess v/s D mess"] !== undefined;

          const team1Key = isCD ? "Players-C" : "Players-A";
          const team2Key = isAC ? "Players-C" : "Players-D";
          const team1Name = isCD ? "C MESS" : "A MESS";
          const team2Name = isAC ? "C MESS" : "D MESS";

          // Match Title Detection
          const matchTitle = isAC ? "A Mess vs C Mess" : isAD ? "A Mess vs D Mess" : isCD ? "C Mess vs D Mess" : "Match Details";

          return (
            <div key={match.id} className="bg-white shadow-2xl rounded-3xl p-6 border-t-8 border-blue-600">
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h3 className="font-black text-blue-500 uppercase text-xs">{matchTitle}</h3>
                <Link to={`/score/${match.id}`} className="bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase hover:bg-blue-700">Live Scorer</Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Team 1 Section */}
                <div>
                  <BattingTable players={match[team1Key] || []} teamName={team1Name} />
                  <BowlingTable players={match[team1Key] || []} teamName={team1Name} />
                </div>

                {/* Team 2 Section */}
                <div>
                  <BattingTable players={match[team2Key] || []} teamName={team2Name} />
                  <BowlingTable players={match[team2Key] || []} teamName={team2Name} />
                </div>
              </div>
              
              <div className="mt-6 bg-slate-900 text-white p-3 rounded-2xl text-center font-black text-xs uppercase tracking-widest">
                Target Score: {match.target || 0}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/score/:matchId" element={<ScoringRoom />} />
      </Routes>
    </Router>
  );
}

export default App;