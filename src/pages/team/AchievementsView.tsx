import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAchievements } from '@/lib/storage';
import { Achievement } from '@/types';
import { Trophy } from 'lucide-react';

const AchievementsView = () => {
  const { teamId } = useParams();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (teamId) {
      setAchievements(getAchievements(teamId));
    }
  }, [teamId]);

  return (
    <Card className="card-elevated animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-success" />
          المهام المنجزة لهذا الأسبوع
        </CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>لا توجد إنجازات مسجلة</p>
          </div>
        ) : (
          <div className="space-y-4">
            {achievements.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-success/5 border border-success/20 rounded-lg animate-fade-in"
              >
                <p className="whitespace-pre-wrap text-foreground">{item.text}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  التاريخ: {item.date}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementsView;
