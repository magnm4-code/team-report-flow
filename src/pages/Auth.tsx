import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Home } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: t('auth.signInError'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('auth.signInSuccess') });
      navigate('/admin');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      toast({ title: t('auth.signUpError'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('auth.signUpSuccess'), description: t('auth.checkEmail') });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="card-elevated">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('auth.title')}</CardTitle>
            <CardDescription>{t('auth.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin" className="flex items-center gap-2"><LogIn className="w-4 h-4" />{t('auth.signIn')}</TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2"><UserPlus className="w-4 h-4" />{t('auth.signUp')}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signinEmail">{t('auth.email')}</Label>
                    <Input id="signinEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" dir="ltr" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signinPassword">{t('auth.password')}</Label>
                    <Input id="signinPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" required />
                  </div>
                  <Button type="submit" className="w-full btn-teal" disabled={loading}>{loading ? t('auth.loading') : t('auth.signInBtn')}</Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">{t('auth.email')}</Label>
                    <Input id="signupEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" dir="ltr" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">{t('auth.password')}</Label>
                    <Input id="signupPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" minLength={6} required />
                  </div>
                  <Button type="submit" className="w-full btn-teal" disabled={loading}>{loading ? t('auth.loading') : t('auth.signUpBtn')}</Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-4 text-center">
              <Button variant="ghost" onClick={() => navigate('/')} className="gap-2"><Home className="w-4 h-4" />{t('auth.backHome')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
