import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';

interface GameHUDProps {
  playerRank: string;
  leadership: number;
  experience: number;
  maxExperience: number;
  turnNumber: number;
  missionObjective: string;
  missionProgress: number;
  onEndTurn: () => void;
  onPauseGame: () => void;
}

export function GameHUD({
  playerRank,
  leadership,
  experience,
  maxExperience,
  turnNumber,
  missionObjective,
  missionProgress,
  onEndTurn,
  onPauseGame
}: GameHUDProps) {
  const getRankBadgeColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'decanus': return 'bg-brown-100 text-brown-800 border-brown-200';
      case 'optio': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'centurion': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'tribune': return 'bg-gold-100 text-gold-800 border-gold-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getExperienceColor = () => {
    const percentage = (experience / maxExperience) * 100;
    if (percentage >= 80) return 'bg-purple-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-green-500';
    return 'bg-gray-500';
  };

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 border-b-4 border-amber-600">
      <div className="flex items-center justify-between">
        {/* Left Section - Player Info */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-2xl">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{playerRank}</span>
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                  Leadership: {leadership}
                </Badge>
              </div>
              <div className="text-sm text-slate-300">Roman Legion Command</div>
            </div>
          </div>

          {/* Experience Bar */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">XP:</span>
            <div className="w-32 bg-slate-700 rounded-full h-3 border border-slate-600">
              <div
                className={`h-full rounded-full transition-all ${getExperienceColor()}`}
                style={{ width: `${(experience / maxExperience) * 100}%` }}
              />
            </div>
            <span className="text-sm text-slate-300">{experience}/{maxExperience}</span>
          </div>
        </div>

        {/* Center Section - Mission Info */}
        <div className="flex-1 mx-8">
          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-sm text-slate-300 mb-1">Mission Objective</div>
                <div className="font-medium text-amber-300 mb-2">{missionObjective}</div>
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-xs text-slate-400">Progress:</span>
                  <div className="w-24 bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${missionProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">{missionProgress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section - Game Controls */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{turnNumber}</div>
            <div className="text-xs text-slate-400">Turn</div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPauseGame}
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              ⏸️ Pause
            </Button>
            <Button
              onClick={onEndTurn}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              End Turn ⏭️
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between text-sm">
        <div className="flex gap-6">
          <span className="text-slate-300">
            🗡️ Combat Phase: <span className="text-white">Active</span>
          </span>
          <span className="text-slate-300">
            🎯 Selected Action: <span className="text-amber-400">None</span>
          </span>
        </div>
        <div className="text-slate-400">
          Use WASD to move camera | Click units to select | Right-click for context menu
        </div>
      </div>
    </div>
  );
}