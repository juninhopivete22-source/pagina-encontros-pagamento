'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import VerificationComponent from '@/components/VerificationComponent';
import VideoCallComponent from '@/components/VideoCallComponent';
import { 
  Heart, 
  X, 
  Video, 
  MessageCircle, 
  Shield, 
  Star, 
  MapPin, 
  Camera,
  Phone,
  Gift,
  Crown,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  images: string[];
  verified: boolean;
  online: boolean;
  interests: string[];
  premium: boolean;
}

const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Ana Silva',
    age: 28,
    location: 'São Paulo, SP',
    bio: 'Amo viajar, cozinhar e conhecer pessoas interessantes. Procuro algo sério!',
    images: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop'],
    verified: true,
    online: true,
    interests: ['Viagem', 'Culinária', 'Música'],
    premium: true
  },
  {
    id: '2',
    name: 'Carlos Mendes',
    age: 32,
    location: 'Rio de Janeiro, RJ',
    bio: 'Empresário, apaixonado por esportes e aventuras. Vamos nos conhecer?',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'],
    verified: true,
    online: false,
    interests: ['Esportes', 'Negócios', 'Aventura'],
    premium: false
  },
  {
    id: '3',
    name: 'Marina Costa',
    age: 25,
    location: 'Belo Horizonte, MG',
    bio: 'Artista e designer. Amo arte, natureza e conversas profundas.',
    images: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop'],
    verified: true,
    online: true,
    interests: ['Arte', 'Design', 'Natureza'],
    premium: true
  },
  {
    id: '4',
    name: 'Rafael Santos',
    age: 30,
    location: 'Brasília, DF',
    bio: 'Médico, gosto de ler, praticar esportes e viajar. Busco alguém especial.',
    images: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop'],
    verified: true,
    online: true,
    interests: ['Medicina', 'Leitura', 'Viagem'],
    premium: true
  },
  {
    id: '5',
    name: 'Camila Oliveira',
    age: 26,
    location: 'Florianópolis, SC',
    bio: 'Engenheira de software, amo tecnologia, praia e bons filmes.',
    images: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop'],
    verified: true,
    online: false,
    interests: ['Tecnologia', 'Praia', 'Cinema'],
    premium: false
  }
];

export default function DatingApp() {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [matches, setMatches] = useState<Profile[]>([]);
  const [chatMessages, setChatMessages] = useState<{[key: string]: string[]}>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(true);

  const currentProfile = mockProfiles[currentProfileIndex];

  useEffect(() => {
    // Simula alguns matches iniciais
    setMatches([mockProfiles[0], mockProfiles[3]]);
    setChatMessages({
      '1': ['Ana Silva: Oi! Como você está?', 'Você: Oi Ana! Tudo bem e você?'],
      '4': ['Rafael Santos: Olá! Vi que temos interesses em comum.']
    });
  }, []);

  const handleLike = () => {
    if (!isUserVerified) {
      setIsVerificationOpen(true);
      return;
    }

    // Simula match (70% de chance para usuários verificados)
    if (Math.random() > 0.3) {
      setMatches(prev => [...prev, currentProfile]);
      setChatMessages(prev => ({...prev, [currentProfile.id]: []}));
    }
    nextProfile();
  };

  const handlePass = () => {
    nextProfile();
  };

  const nextProfile = () => {
    setCurrentProfileIndex(prev => (prev + 1) % mockProfiles.length);
  };

  const sendMessage = () => {
    if (message.trim() && activeChat) {
      setChatMessages(prev => ({
        ...prev,
        [activeChat]: [...(prev[activeChat] || []), `Você: ${message}`]
      }));
      setMessage('');
      
      // Simula resposta automática
      setTimeout(() => {
        const responses = [
          'Que legal! Conte-me mais sobre isso...',
          'Adorei sua mensagem! 😊',
          'Que tal conversarmos por vídeo?',
          'Você parece uma pessoa interessante!',
          'Tenho uma pergunta para você...'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setChatMessages(prev => ({
          ...prev,
          [activeChat]: [...(prev[activeChat] || []), `${matches.find(m => m.id === activeChat)?.name}: ${randomResponse}`]
        }));
      }, 1500);
    }
  };

  const startVideoCall = (profileId: string) => {
    if (!isUserVerified) {
      setIsVerificationOpen(true);
      return;
    }

    const profile = matches.find(p => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
      setIsVideoCallActive(true);
    }
  };

  const handlePayment = async (amount: number, description: string) => {
    const stripe = await stripePromise;
    if (!stripe) return;

    const response = await fetch('/api/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, description }),
    });

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      alert(result.error.message);
    }
  };

  const handleVerificationComplete = () => {
    setIsUserVerified(true);
    setShowVerificationAlert(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            LoveConnect
          </h1>
          <p className="text-gray-600">Encontre seu amor verdadeiro com segurança e autenticidade</p>
          
          {/* Verification Alert */}
          {showVerificationAlert && !isUserVerified && (
            <Card className="mt-4 border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-orange-800">Verifique sua identidade</p>
                    <p className="text-sm text-orange-600">
                      Para sua segurança e de outros usuários, complete a verificação de identidade
                    </p>
                  </div>
                  <Button 
                    onClick={() => setIsVerificationOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Verificar Agora
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verified Badge */}
          {isUserVerified && (
            <Card className="mt-4 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-800">Perfil Verificado</span>
                  <Badge className="bg-green-500">
                    <Shield className="h-3 w-3 mr-1" />
                    Identidade Confirmada
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Descobrir
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Matches ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="premium" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Premium
            </TabsTrigger>
          </TabsList>

          {/* Descobrir Perfis */}
          <TabsContent value="discover">
            <div className="flex justify-center">
              <Card className="w-full max-w-md relative overflow-hidden shadow-2xl">
                <div className="relative">
                  <img 
                    src={currentProfile.images[0]} 
                    alt={currentProfile.name}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    {currentProfile.verified && (
                      <Badge className="bg-blue-500 text-white shadow-lg">
                        <Shield className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                    {currentProfile.online && (
                      <Badge className="bg-green-500 text-white shadow-lg">Online</Badge>
                    )}
                    {currentProfile.premium && (
                      <Badge className="bg-yellow-500 text-white shadow-lg">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  
                  {/* Gradient overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold">{currentProfile.name}, {currentProfile.age}</h3>
                    <div className="flex items-center text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{currentProfile.location}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{currentProfile.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {currentProfile.interests.map((interest, index) => (
                      <Badge key={index} variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="rounded-full w-16 h-16 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                      onClick={handlePass}
                    >
                      <X className="h-6 w-6 text-red-500" />
                    </Button>
                    <Button 
                      size="lg" 
                      className="rounded-full w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={handleLike}
                    >
                      <Heart className="h-6 w-6" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Matches */}
          <TabsContent value="matches">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <div className="relative">
                    <img 
                      src={match.images[0]} 
                      alt={match.name}
                      className="w-full h-48 object-cover"
                    />
                    {match.online && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                    )}
                    {match.verified && (
                      <Badge className="absolute top-2 left-2 bg-blue-500 text-white">
                        <Shield className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{match.name}, {match.age}</h3>
                    <p className="text-sm text-gray-500 mb-3 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {match.location}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setActiveChat(match.id)}
                        className="flex-1 hover:bg-blue-50"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => startVideoCall(match.id)}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Vídeo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {matches.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Ainda não há matches</p>
                  <p className="text-gray-400">Continue descobrindo perfis para encontrar alguém especial!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Chat */}
          <TabsContent value="chat">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Conversas */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Conversas</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {matches.map((match) => (
                    <div 
                      key={match.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${activeChat === match.id ? 'bg-blue-50 border-blue-200' : ''}`}
                      onClick={() => setActiveChat(match.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={match.images[0]} />
                            <AvatarFallback>{match.name[0]}</AvatarFallback>
                          </Avatar>
                          {match.online && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{match.name}</p>
                          <p className="text-sm text-gray-500">
                            {chatMessages[match.id]?.length > 0 
                              ? chatMessages[match.id][chatMessages[match.id].length - 1].substring(0, 30) + '...'
                              : 'Diga olá!'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Área de Chat */}
              <Card className="lg:col-span-2">
                {activeChat ? (
                  <>
                    <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={matches.find(m => m.id === activeChat)?.images[0]} />
                            <AvatarFallback>{matches.find(m => m.id === activeChat)?.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{matches.find(m => m.id === activeChat)?.name}</CardTitle>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${matches.find(m => m.id === activeChat)?.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              {matches.find(m => m.id === activeChat)?.online ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startVideoCall(activeChat)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600"
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Chamada
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-96 overflow-y-auto p-4 space-y-3">
                        {chatMessages[activeChat]?.map((msg, index) => (
                          <div 
                            key={index} 
                            className={`flex ${msg.startsWith('Você:') ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs px-4 py-2 rounded-lg shadow-sm ${
                              msg.startsWith('Você:') 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {msg.replace(/^(Você:|.*?:)\s*/, '')}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t p-4 bg-gray-50">
                        <div className="flex gap-2">
                          <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            className="flex-1"
                          />
                          <Button 
                            onClick={sendMessage}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          >
                            Enviar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Selecione uma conversa para começar</p>
                      <p className="text-gray-400">Conecte-se com seus matches e inicie uma conversa!</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Premium */}
          <TabsContent value="premium">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 border-yellow-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <CardTitle className="text-xl">Premium Básico</CardTitle>
                  <CardDescription>Recursos essenciais para encontrar o amor</CardDescription>
                  <div className="text-3xl font-bold text-yellow-600">R$ 29,90/mês</div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Verificação de identidade prioritária</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <span className="text-sm">Likes ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Chat sem limites</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Ver quem curtiu você</span>
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => handlePayment(29.90, 'Premium Básico - 1 mês')}
                  >
                    Assinar Agora
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 relative hover:shadow-lg transition-shadow">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500">Mais Popular</Badge>
                </div>
                <CardHeader className="text-center">
                  <Star className="h-12 w-12 text-purple-500 mx-auto mb-2" />
                  <CardTitle className="text-xl">Premium Plus</CardTitle>
                  <CardDescription>Experiência completa de relacionamento</CardDescription>
                  <div className="text-3xl font-bold text-purple-600">R$ 49,90/mês</div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Tudo do Premium Básico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Chamadas de vídeo ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">5 Super Likes diários</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-pink-500" />
                    <span className="text-sm">Presentes virtuais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Perfil em destaque</span>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500"
                    onClick={() => handlePayment(49.90, 'Premium Plus - 1 mês')}
                  >
                    Assinar Agora
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-pink-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Heart className="h-12 w-12 text-pink-500 mx-auto mb-2" />
                  <CardTitle className="text-xl">Premium VIP</CardTitle>
                  <CardDescription>Para quem busca o melhor do melhor</CardDescription>
                  <div className="text-3xl font-bold text-pink-600">R$ 79,90/mês</div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Tudo do Premium Plus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Perfil super destacado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Fotos ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Suporte prioritário 24/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">10 Super Likes diários</span>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-pink-500 to-red-500"
                    onClick={() => handlePayment(79.90, 'Premium VIP - 1 mês')}
                  >
                    Assinar Agora
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Componentes de Modal */}
        <VerificationComponent 
          isOpen={isVerificationOpen}
          onClose={() => setIsVerificationOpen(false)}
          onVerified={handleVerificationComplete}
        />

        {selectedProfile && (
          <VideoCallComponent
            isOpen={isVideoCallActive}
            onClose={() => setIsVideoCallActive(false)}
            participant={{
              id: selectedProfile.id,
              name: selectedProfile.name,
              image: selectedProfile.images[0]
            }}
          />
        )}
      </div>
    </div>
  );
}