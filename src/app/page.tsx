import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MessageCircle, Video, CreditCard } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Home() {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [paymentAmount, setPaymentAmount] = useState(10); // Default amount

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatMessages([...chatMessages, message]);
      setMessage('');
    }
  };

  const handlePayment = async () => {
    const stripe = await stripePromise;
    if (!stripe) return;

    const response = await fetch('/api/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: paymentAmount }),
    });

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      alert(result.error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">Plataforma de Encontros e Conversas</h1>

      <Tabs defaultValue="encontros" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="encontros">Encontros</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
        </TabsList>

        <TabsContent value="encontros">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agendar Encontro
              </CardTitle>
              <CardDescription>
                Agende um encontro personalizado com nossos especialistas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <Input placeholder="Nome" />
                <Input placeholder="Email" type="email" />
                <Input placeholder="Data" type="date" />
                <Textarea placeholder="Descrição do encontro" />
                <Button type="submit">Agendar</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Transmissão ao Vivo
              </CardTitle>
              <CardDescription>
                Assista às transmissões ao vivo em tempo real.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <p>Player de vídeo ao vivo aqui</p>
              </div>
              <Button className="mt-4">Entrar na Live</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat ao Vivo
              </CardTitle>
              <CardDescription>
                Converse em tempo real com nossos especialistas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto border rounded p-2 mb-4">
                {chatMessages.map((msg, index) => (
                  <p key={index} className="mb-2">{msg}</p>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>Enviar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagamento">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Formas de Pagamento
              </CardTitle>
              <CardDescription>
                Escolha sua forma de pagamento preferida.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Valor (USD)"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                />
                <Button onClick={handlePayment}>Pagar com Stripe</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}