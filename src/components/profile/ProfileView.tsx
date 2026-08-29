import React, { useState } from 'react';
import {
  User,
  Flame,
  Award,
  Download,
  Trash2,
  LogIn,
  Calendar,
  Zap,
  Target,
  Sparkles,
  Layers,
  Crown,
  Moon,
  Code2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { evaluateAchievements } from '../../utils/achievements';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

export const ProfileView: React.FC = () => {
  const { user, profile, signInWithGoogle, deleteAccount } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { allEvaluated } = evaluateAchievements(
    profile || {},
    undefined,
    profile?.achievements || []
  );

  const unlockedCount = allEvaluated.filter((a) => a.isUnlocked).length;

  const handleExportData = () => {
    if (!profile) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `typeforge_profile_${profile.uid || 'user'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteAccount();
    setIsDeleting(false);
    setShowDeleteModal(false);
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5" />;
      case 'Trophy':
        return <Award className="w-5 h-5" />;
      case 'Crown':
        return <Crown className="w-5 h-5" />;
      case 'Target':
        return <Target className="w-5 h-5" />;
      case 'CalendarCheck':
        return <Calendar className="w-5 h-5" />;
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'Code2':
        return <Code2 className="w-5 h-5" />;
      case 'Moon':
        return <Moon className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Profile Header */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[var(--accent)]"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-glow)] text-[var(--accent)] border-2 border-[var(--accent)]/40 flex items-center justify-center text-2xl font-black">
                {profile?.displayName?.charAt(0) || <User className="w-8 h-8" />}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  {profile?.displayName || (user ? 'Typist' : 'Guest Typist')}
                </h2>
                {user && (
                  <Badge variant="accent" className="text-[10px]">
                    Google Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {profile?.email || 'Anonymous session'}
              </p>
              {profile?.createdAt && (
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] mt-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Streak & Milestone Summary Card */}
          <div className="flex items-center gap-4 bg-[var(--bg-surface-hover)]/70 px-4 py-3 rounded-xl border border-[var(--border-subtle)]">
            <div className="text-center">
              <div className="text-xs text-[var(--text-muted)] uppercase font-semibold">Streak</div>
              <div className="text-2xl font-black font-typing text-amber-400 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-amber-500" />
                <span>{profile?.currentStreak || 0}d</span>
              </div>
            </div>
            <div className="w-px h-8 bg-[var(--border-subtle)]" />
            <div className="text-center">
              <div className="text-xs text-[var(--text-muted)] uppercase font-semibold">Best Streak</div>
              <div className="text-xl font-bold font-typing text-[var(--text-primary)]">
                {profile?.longestStreak || 0}d
              </div>
            </div>
          </div>
        </div>

        {/* Anonymous login CTA */}
        {!user && (
          <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[var(--text-secondary)] text-center sm:text-left">
              Link your account with Google to securely store achievements, streaks, and personal stats across devices.
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={signInWithGoogle}
              icon={<LogIn className="w-3.5 h-3.5" />}
            >
              Sign In with Google
            </Button>
          </div>
        )}
      </div>

      {/* Achievements Gallery */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Achievements ({unlockedCount} / {allEvaluated.length})
            </h3>
          </div>
          <span className="text-xs text-[var(--text-secondary)]">
            {Math.round((unlockedCount / allEvaluated.length) * 100)}% Complete
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allEvaluated.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.isUnlocked
                  ? 'bg-[var(--bg-surface)] border-amber-500/30'
                  : 'bg-[var(--bg-surface)]/50 border-[var(--border-subtle)] opacity-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-lg shrink-0 ${
                    item.isUnlocked
                      ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                      : 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)]'
                  }`}
                >
                  {getAchievementIcon(item.iconName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {item.title}
                    </h4>
                    {item.isUnlocked && (
                      <span className="text-[10px] text-amber-400 font-bold uppercase">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
                    {item.description}
                  </p>

                  {!item.isUnlocked && (
                    <div className="mt-2.5">
                      <div className="w-full h-1.5 rounded-full bg-[var(--bg-surface-hover)] overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent)] rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Data & Privacy Controls */}
      {user && (
        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
            Data & Privacy Management
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            You own your typing records. Export your complete data as JSON or permanently remove your account.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportData}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export JSON Data
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Account Data
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account & Data"
      >
        <div className="space-y-4 text-xs text-[var(--text-secondary)]">
          <p>
            Are you sure you want to delete your TypeForge account and all associated test history, streaks, and statistics?
          </p>
          <p className="font-semibold text-red-400">
            This action is permanent and cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Permanently Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
