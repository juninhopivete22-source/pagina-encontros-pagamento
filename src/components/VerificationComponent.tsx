'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Shield, 
  Camera, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Upload,
  User,
  Phone
} from 'lucide-react';

interface VerificationComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export default function VerificationComponent({ isOpen, onClose, onVerified }: VerificationComponentProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationData, setVerificationData] = useState({
    document: '',
    phone: '',
    selfie: false,
    documentPhoto: false
  });

  const steps = [
    { id: 1, title: 'Documento', icon: FileText, description: 'Envie uma foto do seu documento' },
    { id: 2, title: 'Selfie', icon: Camera, description: 'Tire uma selfie segurando o documento' },
    { id: 3, title: 'Telefone', icon: Phone, description: 'Confirme seu número de telefone' },
    { id: 4, title: 'Revisão', icon: CheckCircle, description: 'Aguarde a verificação' }
  ];

  const handleDocumentUpload = () => {
    setVerificationData(prev => ({ ...prev, documentPhoto: true }));
    setCurrentStep(2);
  };

  const handleSelfieUpload = () => {
    setVerificationData(prev => ({ ...prev, selfie: true }));
    setCurrentStep(3);
  };

  const handlePhoneVerification = () => {
    if (verificationData.phone.length >= 10) {
      setCurrentStep(4);
      // Simula verificação bem-sucedida após 3 segundos
      setTimeout(() => {
        onVerified();
        onClose();
      }, 3000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Verificação de Identidade
          </DialogTitle>
          <DialogDescription>
            Para garantir a segurança de todos, precisamos verificar sua identidade
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep > step.id ? 'bg-green-500 text-white' :
                  currentStep === step.id ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs mt-1 text-center">{step.title}</span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mt-2 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <Card>
            <CardContent className="p-6">
              {currentStep === 1 && (
                <div className="text-center space-y-4">
                  <FileText className="h-16 w-16 text-blue-500 mx-auto" />
                  <h3 className="text-lg font-semibold">Documento de Identidade</h3>
                  <p className="text-gray-600">
                    Envie uma foto clara do seu RG, CNH ou Passaporte
                  </p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-4">Clique para enviar ou arraste o arquivo</p>
                    <Button onClick={handleDocumentUpload}>
                      Enviar Documento
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <AlertCircle className="h-4 w-4" />
                    Seus dados são criptografados e seguros
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="text-center space-y-4">
                  <Camera className="h-16 w-16 text-blue-500 mx-auto" />
                  <h3 className="text-lg font-semibold">Selfie com Documento</h3>
                  <p className="text-gray-600">
                    Tire uma selfie segurando seu documento ao lado do rosto
                  </p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <div className="bg-gray-100 rounded-lg p-4 mb-4">
                      <User className="h-12 w-12 text-gray-400 mx-auto" />
                    </div>
                    <Button onClick={handleSelfieUpload}>
                      Tirar Selfie
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <AlertCircle className="h-4 w-4" />
                    Certifique-se de que seu rosto e documento estão visíveis
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="text-center space-y-4">
                  <Phone className="h-16 w-16 text-blue-500 mx-auto" />
                  <h3 className="text-lg font-semibold">Verificação de Telefone</h3>
                  <p className="text-gray-600">
                    Confirme seu número para receber o código de verificação
                  </p>
                  <div className="max-w-sm mx-auto space-y-4">
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={verificationData.phone}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                    <Button 
                      onClick={handlePhoneVerification}
                      disabled={verificationData.phone.length < 10}
                      className="w-full"
                    >
                      Enviar Código
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="text-center space-y-4">
                  <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <h3 className="text-lg font-semibold">Verificando Identidade</h3>
                  <p className="text-gray-600">
                    Nossa equipe está analisando seus documentos. Isso pode levar alguns minutos.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Verificação em andamento...</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Por que verificamos identidades?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Garante que você está falando com pessoas reais</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Reduz perfis falsos e golpes</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Aumenta a confiança entre os usuários</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Cria um ambiente mais seguro para relacionamentos</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}