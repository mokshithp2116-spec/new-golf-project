'use client';

import { useState, useEffect } from 'react';
import {
  getUserGolfScores,
  addGolfScore,
  updateGolfScore,
  deleteGolfScore,
  getCurrentUser,
} from '@/lib/storage';
import { GolfScore } from '@/types';
import {
  Calendar,
  Trophy,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  Info,
  TrendingUp,
  MapPin,
} from 'lucide-react';

interface ScoreManagerProps {
  userId?: string;
  onScoresChanged?: () => void;
  readOnly?: boolean;
}

export default function ScoreManager({ userId, onScoresChanged, readOnly = false }: ScoreManagerProps) {
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [newScore, setNewScore] = useState<string>('');
  const [newDate, setNewDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [courseName, setCourseName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit state
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editScoreVal, setEditScoreVal] = useState<string>('');
  const [editDateVal, setEditDateVal] = useState<string>('');
  const [editCourseVal, setEditCourseVal] = useState<string>('');
  const [editNotesVal, setEditNotesVal] = useState<string>('');

  const activeUserId = userId || getCurrentUser()?.id || '';

  const loadScores = async () => {
    try {
      const res = await fetch('/api/scores', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.scores) {
        setScores(data.scores);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadScores();
  }, []);

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const scoreNum = parseInt(newScore, 10);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError('Stableford score must be between 1 and 45 (§ 05).');
      return;
    }

    if (!newDate) {
      setError('Please select a valid date for this golf round.');
      return;
    }

    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: scoreNum,
          date: newDate,
          courseName,
          notes,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to add score.');
        return;
      }

      setNewScore('');
      setCourseName('');
      setNotes('');
      setSuccess(
        scores.length >= 5
          ? `Round added! As required by § 05, the oldest stored score was automatically rolled off.`
          : `Round added successfully! (${scores.length + 1}/5 scores recorded)`
      );

      await loadScores();
      if (onScoresChanged) onScoresChanged();
      setTimeout(() => setSuccess(null), 5000);
    } catch {
      setError('Failed to add score due to network error.');
    }
  };

  const handleStartEdit = (sc: GolfScore) => {
    setEditingScoreId(sc.id);
    setEditScoreVal(sc.score.toString());
    setEditDateVal(sc.date);
    setEditCourseVal(sc.courseName || '');
    setEditNotesVal(sc.notes || '');
    setError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScoreId) return;

    const scoreNum = parseInt(editScoreVal, 10);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError('Stableford score must be between 1 and 45.');
      return;
    }

    try {
      const res = await fetch('/api/scores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scoreId: editingScoreId,
          score: scoreNum,
          date: editDateVal,
          courseName: editCourseVal,
          notes: editNotesVal,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Update failed.');
        return;
      }

      setEditingScoreId(null);
      setSuccess('Round updated successfully.');
      await loadScores();
      if (onScoresChanged) onScoresChanged();
      setTimeout(() => setSuccess(null), 3500);
    } catch {
      setError('Failed to update score.');
    }
  };

  const handleDelete = async (scoreId: string) => {
    if (confirm('Are you sure you want to delete this score entry?')) {
      try {
        const res = await fetch(`/api/scores?id=${scoreId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          await loadScores();
          if (onScoresChanged) onScoresChanged();
        } else {
          setError(data.message || 'Failed to delete score.');
        }
      } catch {
        setError('Network error deleting score.');
      }
    }
  };

  const averageScore =
    scores.length > 0
      ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1)
      : '—';
  const highestScore = scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : '—';

  return (
    <div className="space-y-6">
      {/* Header Info & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
            {scores.length}/5
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Active Rolling Scores</div>
            <div className="text-sm font-semibold text-white">
              {scores.length === 5 ? 'Full Entry (Ready for Draw)' : `${5 - scores.length} more needed`}
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">5-Round Average</div>
            <div className="text-sm font-semibold text-white">{averageScore} pts</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Season Peak</div>
            <div className="text-sm font-semibold text-white">{highestScore} pts</div>
          </div>
        </div>
      </div>

      {/* Rules banner (§ 05) */}
      <div className="p-3.5 bg-slate-900/80 border border-white/10 rounded-2xl flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="text-white font-semibold">Rolling 5-Score Rule (§ 05):</span> Stableford scores range from <strong className="text-orange-300">1–45</strong>. Only the latest 5 scores are retained. Submitting a new round automatically replaces the oldest stored round. Only <strong className="text-orange-300">one score per date</strong> is permitted.
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Add New Score Form */}
      {!readOnly && (
        <form onSubmit={handleAddScore} className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-orange-400" />
              Log New Stableford Round
            </h4>
            <span className="text-[11px] text-slate-400">Stableford 1–45</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Score (1–45) *
              </label>
              <input
                type="number"
                min="1"
                max="45"
                required
                placeholder="e.g. 38"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Round Date *
              </label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Course / Club
              </label>
              <input
                type="text"
                placeholder="e.g. Royal Melbourne"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Submit Round
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Edit Modal / Floating dialog */}
      {editingScoreId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-md bg-[#131824] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-orange-400" />
              Edit Existing Round Entry
            </h4>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Score (1–45)</label>
              <input
                type="number"
                min="1"
                max="45"
                required
                value={editScoreVal}
                onChange={(e) => setEditScoreVal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={editDateVal}
                onChange={(e) => setEditDateVal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Course</label>
              <input
                type="text"
                value={editCourseVal}
                onChange={(e) => setEditCourseVal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Notes</label>
              <input
                type="text"
                value={editNotesVal}
                onChange={(e) => setEditNotesVal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingScoreId(null)}
                className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-xs transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Scores List (§ 05: Reverse Chronological Order) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs text-slate-400 font-semibold px-1">
          <span>Active 5-Round Scorecard (Most Recent First)</span>
          <span>{scores.length} of 5 slots filled</span>
        </div>

        {scores.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">
            No rounds recorded yet. Log your first Stableford round above to start qualifying for the monthly draw!
          </div>
        ) : (
          <div className="space-y-2.5">
            {scores.map((sc, idx) => (
              <div
                key={sc.id}
                className="glass-panel p-4 rounded-2xl flex items-center justify-between transition hover:border-white/20"
              >
                <div className="flex items-center gap-4">
                  {/* Score ball */}
                  <div className="ball-number shrink-0 text-orange-400 border-orange-500/30">
                    {sc.score}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {sc.courseName || 'Official Round'}
                      </span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Latest
                        </span>
                      )}
                      {idx === 4 && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 text-[10px]">
                          Oldest (Next to roll out)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {sc.date}
                      </span>
                      {sc.notes && <span className="text-slate-500 italic">“{sc.notes}”</span>}
                    </div>
                  </div>
                </div>

                {!readOnly && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(sc)}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                      title="Edit this round"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sc.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                      title="Delete this round"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
