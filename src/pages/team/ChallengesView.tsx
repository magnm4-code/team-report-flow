import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getChallenges } from '@/lib/storage';
import { Challenge } from '@/types';
import { AlertTriangle } from 'lucide-react';

const ChallengesView = () => {
  const { teamId } = useParams();
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    if (teamId) {
      setChallenges(getChallenges(teamId));
    }
  }, [teamId]);

  return (
    <Card className="card-elevated animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          التحديات والصعوبات
        </CardTitle>
      </CardHeader>
      <CardContent>
        {challenges.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>لا توجد تحديات مسجلة</p>
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg animate-fade-in"
              >
                <p className="whitespace-pre-wrap text-foreground font-medium">{item.text}</p>
                {item.supportNeeded && (
                  <div className="mt-3 p-3 bg-highlight/10 border border-highlight/20 rounded">
                    <p className="text-sm text-highlight font-medium mb-1">الدعم المطلوب:</p>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                      {item.supportNeeded}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChallengesView;
