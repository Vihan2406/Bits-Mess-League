import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from './firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';

const ScoringRoom = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [activeTeam, setActiveTeam] = useState(null);
  const [b1Idx, setB1Idx] = useState(0); 
  const [b2Idx, setB2Idx] = useState(1); 
  const [bowlerIdx, setBowlerIdx] = useState(0); 
  const [onStrike, setOnStrike] = useState(0);   

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "matches", matchId), (docSnap) => {
      const data = docSnap.data();
      setMatch(data);
      if (!activeTeam && data) {
        if (data["Players-A"]) setActiveTeam('A');
        else if (data["Players-C"]) setActiveTeam('C');
        else if (data["Players-D"]) setActiveTeam('D');
      }
    });
    return () => unsubscribe();
  }, [matchId, activeTeam]);

  if (!match || !activeTeam) return <div className="p-10 text-center text-white bg-slate-900 min-h-screen">Loading Scorer...</div>;

  const availableTeams = ['A', 'C', 'D'].filter(t => match[`Players-${t}`]);
  const battingSquadKey = `Players-${activeTeam}`;
  const battingSquad = [...(match[battingSquadKey] || [])];
  const bowlingTeam = availableTeams.find(t => t !== activeTeam) || 'B';
  const bowlingSquadKey = `Players-${bowlingTeam}`;
  const bowlingSquad = [...(match[bowlingSquadKey] || [])];

  const getName = (p, i) => (typeof p === 'object' ? p.name : p) || `Player ${i + 1}`;
  
  const ensureObject = (p) => {
    if (typeof p === 'string') return { name: p, runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, runs_conceded: 0, overs_bowled: 0 };
    return { ...p };
  };

  // Logic for Extras (Wide/No Ball)
  const handleExtra = async (type) => {
    const matchRef = doc(db, "matches", matchId);
    const currentBowling = [...bowlingSquad];
    let bowler = ensureObject(currentBowling[bowlerIdx]);

    // Extra adds 1 run to score and bowler, but NO ball is counted
    bowler.runs_conceded = (bowler.runs_conceded || 0) + 1;
    currentBowling[bowlerIdx] = bowler;

    await updateDoc(matchRef, {
      [`Score-${activeTeam}`]: increment(1),
      "BowlerRuns": increment(1),
      [bowlingSquadKey]: currentBowling
    });
  };

  const handleWicket = async () => {
    const matchRef = doc(db, "matches", matchId);
    const currentBatting = [...battingSquad];
    const currentBowling = [...bowlingSquad];
    
    const batterIdx = onStrike === 0 ? b1Idx : b2Idx;
    let batter = ensureObject(currentBatting[batterIdx]);
    let bowler = ensureObject(currentBowling[bowlerIdx]);

    batter.balls = (batter.balls || 0) + 1;
    bowler.wickets = (bowler.wickets || 0) + 1;

    let newBalls = (match["CurrentBalls"] || 0) + 1;
    const overKey = `Overs-${activeTeam}`;
    let teamOvers = match[overKey] || 0;

    if (newBalls >= 6) {
      teamOvers += 1;
      newBalls = 0;
      bowler.overs_bowled = (bowler.overs_bowled || 0) + 1;
    }

    currentBatting[batterIdx] = batter;
    currentBowling[bowlerIdx] = bowler;

    await updateDoc(matchRef, {
      [`Wickets-${activeTeam === 'A' ? 'A' : 'B'}`]: increment(1),
      [overKey]: teamOvers,
      "CurrentBalls": newBalls,
      [battingSquadKey]: currentBatting,
      [bowlingSquadKey]: currentBowling
    });
    alert("Wicket! Select next batsman.");
  };

  const handleBall = async (runs) => {
    const matchRef = doc(db, "matches", matchId);
    const currentBatting = [...battingSquad];
    const currentBowling = [...bowlingSquad];
    
    const batterIdx = onStrike === 0 ? b1Idx : b2Idx;
    let batter = ensureObject(currentBatting[batterIdx]);
    let bowler = ensureObject(currentBowling[bowlerIdx]);

    batter.runs = (batter.runs || 0) + runs;
    batter.balls = (batter.balls || 0) + 1;
    if (runs === 4) batter.fours = (batter.fours || 0) + 1;
    if (runs === 6) batter.sixes = (batter.sixes || 0) + 1;
    bowler.runs_conceded = (bowler.runs_conceded || 0) + runs;

    let newBalls = (match["CurrentBalls"] || 0) + 1;
    const overKey = `Overs-${activeTeam}`;
    let teamOvers = match[overKey] || 0;

    if (newBalls >= 6) {
      teamOvers += 1;
      newBalls = 0;
      bowler.overs_bowled = (bowler.overs_bowled || 0) + 1;
    }

    currentBatting[batterIdx] = batter;
    currentBowling[bowlerIdx] = bowler;

    await updateDoc(matchRef, {
      [`Score-${activeTeam}`]: increment(runs),
      [overKey]: teamOvers,
      "CurrentBalls": newBalls,
      "BowlerRuns": increment(runs),
      [battingSquadKey]: currentBatting,
      [bowlingSquadKey]: currentBowling
    });

    if (runs === 1 || runs === 3) setOnStrike(onStrike === 0 ? 1 : 0);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <Link to="/" className="text-blue-400 text-xs font-bold uppercase underline">← Back</Link>
        <div className="flex gap-2">
          {availableTeams.map(t => (
            <button key={t} onClick={() => setActiveTeam(t)} className={`px-4 py-1 rounded-full text-[10px] font-bold ${activeTeam === t ? 'bg-blue-600' : 'bg-slate-700'}`}>TEAM {t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest ml-2">Batting: Team {activeTeam}</h3>
          {[ {idx: b1Idx, set: setB1Idx, id: 0}, {idx: b2Idx, set: setB2Idx, id: 1} ].map((b) => (
            <div key={b.id} className={`p-5 rounded-3xl border-2 transition-all ${onStrike === b.id ? 'bg-blue-900/40 border-blue-500 shadow-lg' : 'bg-slate-800 border-transparent opacity-60'}`}>
              <select value={b.idx} onChange={(e) => b.set(parseInt(e.target.value))} className="bg-transparent text-xl font-black outline-none w-full">
                {battingSquad.map((p, i) => <option key={i} value={i} className="bg-slate-800">{getName(p, i)}</option>)}
              </select>
              <p className="text-3xl font-black mt-2">{typeof battingSquad[b.idx] === 'object' ? (battingSquad[b.idx].runs || 0) : 0} <span className="text-sm font-normal text-slate-400">({typeof battingSquad[b.idx] === 'object' ? (battingSquad[b.idx].balls || 0) : 0})</span></p>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2, 4, 6].map(run => (
              <button key={run} onClick={() => handleBall(run)} className="bg-blue-600 h-16 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-transform">+{run}</button>
            ))}
            <button onClick={() => setOnStrike(onStrike === 0 ? 1 : 0)} className="bg-purple-600 h-16 rounded-2xl font-black text-xs uppercase shadow-lg">Swap Strike</button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-green-400 uppercase tracking-widest ml-2">Bowling: Team {bowlingTeam}</h3>
          <div className="bg-slate-800 p-8 rounded-3xl border-2 border-green-500/30">
            <select value={bowlerIdx} onChange={(e) => setBowlerIdx(parseInt(e.target.value))} className="bg-transparent text-2xl font-black outline-none w-full border-b border-slate-700 pb-2 mb-6">
              {bowlingSquad.map((p, i) => <option key={i} value={i} className="bg-slate-800">{getName(p, i)}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div><p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Wickets</p><p className="text-4xl font-black text-white">{typeof bowlingSquad[bowlerIdx] === 'object' ? (bowlingSquad[bowlerIdx].wickets || 0) : 0}</p></div>
              <div><p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Overs Bowled</p><p className="text-4xl font-black text-white">{typeof bowlingSquad[bowlerIdx] === 'object' ? (bowlingSquad[bowlerIdx].overs_bowled || 0) : 0}.{match["CurrentBalls"] || 0}</p></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleExtra('WD')} className="bg-yellow-600 py-4 rounded-2xl font-black text-xs uppercase shadow-lg active:scale-95">Wide (+1)</button>
            <button onClick={() => handleExtra('NB')} className="bg-orange-600 py-4 rounded-2xl font-black text-xs uppercase shadow-lg active:scale-95">No Ball (+1)</button>
          </div>
          <button onClick={handleWicket} className="w-full bg-red-600 py-5 rounded-2xl font-black text-sm uppercase shadow-xl active:scale-95">Wicket Out</button>
          <button onClick={async () => await updateDoc(doc(db, "matches", matchId), { "BowlerRuns": 0, "CurrentBalls": 0 })} className="w-full bg-slate-700 py-3 rounded-2xl font-bold text-[10px] uppercase">Reset Current Over</button>
        </div>
      </div>
    </div>
  );
};

export default ScoringRoom;