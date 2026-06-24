import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClubPortal } from '../../contexts/ClubPortalContext';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { 
  TrophyIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChartBarIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LeaderboardView = () => {
  const { club, clubSlug, isAdmin, isModerator, currentUser } = useClubPortal();
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const {
    leaderboards,
    entries,
    loading,
    error,
    createLeaderboard,
    updateScore,
    resetLeaderboard,
    searchEntries,
    topThree
  } = useLeaderboard(club?.id, selectedBoard, { realtime: true });

  // Form states
  const [newBoardForm, setNewBoardForm] = useState({
    title: '',
    metric: 'points',
    resetCycle: 'none'
  });
  const [scoreForm, setScoreForm] = useState({
    scoreChange: '',
    reason: ''
  });

  const filteredEntries = searchEntries(searchTerm);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardForm.title.trim()) {
      toast.error('Please enter a board title');
      return;
    }

    try {
      const boardId = await createLeaderboard(newBoardForm, currentUser.uid);
      setSelectedBoard(boardId);
      setShowCreateModal(false);
      setNewBoardForm({ title: '', metric: 'points', resetCycle: 'none' });
    } catch (error) {
      console.error('Error creating leaderboard:', error);
    }
  };

  const handleUpdateScore = async (e) => {
    e.preventDefault();
    if (!selectedEntry || !scoreForm.scoreChange) {
      toast.error('Please enter a score change');
      return;
    }

    try {
      await updateScore(
        selectedBoard,
        selectedEntry.entityId,
        parseInt(scoreForm.scoreChange),
        currentUser.uid,
        { name: selectedEntry.name }
      );
      setShowScoreModal(false);
      setScoreForm({ scoreChange: '', reason: '' });
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const handleReset = async () => {
    if (!selectedBoard) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to reset this leaderboard? This action cannot be undone.'
    );
    
    if (confirmed) {
      try {
        const archiveName = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
        await resetLeaderboard(selectedBoard, archiveName);
      } catch (error) {
        console.error('Error resetting leaderboard:', error);
      }
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-600 dark:text-yellow-400';
      case 2: return 'text-gray-600 dark:text-gray-400';
      case 3: return 'text-amber-600 dark:text-amber-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leaderboards
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Track rankings and competition scores
          </p>
        </div>
        
        {(isAdmin || isModerator) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Board</span>
          </button>
        )}
      </div>

      {/* Board Selection */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
        <div className="flex items-center space-x-3">
          <select
            value={selectedBoard || ''}
            onChange={(e) => setSelectedBoard(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select Leaderboard</option>
            {leaderboards.map(board => (
              <option key={board.id} value={board.id}>
                {board.title} ({board.metric})
              </option>
            ))}
          </select>
          
          {selectedBoard && (isAdmin || isModerator) && (
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors flex items-center space-x-1"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {selectedBoard && (
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}
      </div>

      {!selectedBoard ? (
        <div className="text-center py-12">
          <TrophyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No leaderboard selected
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {leaderboards.length === 0 
              ? 'Create your first leaderboard to start tracking scores.'
              : 'Select a leaderboard from the dropdown above.'
            }
          </p>
          {leaderboards.length === 0 && (isAdmin || isModerator) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Create First Leaderboard
            </button>
          )}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No entries yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Scores will appear here once members start competing.
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Performers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topThree.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-br rounded-xl p-6 text-center ${
                      entry.rank === 1 
                        ? 'from-yellow-400 to-yellow-600 text-white'
                        : entry.rank === 2
                        ? 'from-gray-400 to-gray-600 text-white'
                        : 'from-amber-400 to-amber-600 text-white'
                    }`}
                  >
                    <div className="text-3xl mb-2">{getRankIcon(entry.rank)}</div>
                    <h3 className="font-bold text-lg mb-1">{entry.name}</h3>
                    <p className="text-2xl font-bold">{entry.score}</p>
                    <p className="text-sm opacity-90">
                      {leaderboards.find(b => b.id === selectedBoard)?.metric || 'points'}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Full Rankings
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Updated
                    </th>
                    {(isAdmin || isModerator) && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEntries.map((entry, index) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-bold ${getRankColor(entry.rank)}`}>
                          {getRankIcon(entry.rank)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {entry.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {entry.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {entry.score}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(entry.lastUpdated).toLocaleDateString()}
                      </td>
                      {(isAdmin || isModerator) && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedEntry(entry);
                              setShowScoreModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Update Score
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create Board Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create Leaderboard
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCreateBoard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newBoardForm.title}
                    onChange={(e) => setNewBoardForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Tournament Rankings"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Metric
                  </label>
                  <select
                    value={newBoardForm.metric}
                    onChange={(e) => setNewBoardForm(prev => ({ ...prev, metric: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="points">Points</option>
                    <option value="wins">Wins</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reset Cycle
                  </label>
                  <select
                    value={newBoardForm.resetCycle}
                    onChange={(e) => setNewBoardForm(prev => ({ ...prev, resetCycle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="none">Never</option>
                    <option value="monthly">Monthly</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Score Modal */}
      <AnimatePresence>
        {showScoreModal && selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowScoreModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Update Score
                </h2>
                <button
                  onClick={() => setShowScoreModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>{selectedEntry.name}</strong>
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  Current Score: {selectedEntry.score}
                </p>
              </div>

              <form onSubmit={handleUpdateScore} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Score Change (+ or -)
                  </label>
                  <input
                    type="number"
                    value={scoreForm.scoreChange}
                    onChange={(e) => setScoreForm(prev => ({ ...prev, scoreChange: e.target.value }))}
                    placeholder="e.g., +10 or -5"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={scoreForm.reason}
                    onChange={(e) => setScoreForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="e.g., Won tournament match"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowScoreModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Update
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaderboardView;
