import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { createApplication } from '../../services/api';
import { useToast } from '../../hooks/useToast';

// Components
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { RadioGroup, RadioGroupItem } from '../../components/ui/RadioGroup';
import { Label } from '../../components/ui/Label';

type ProgramType = 'undergraduate' | 'graduate' | 'phd';

const programs = {
  undergraduate: [
    'Bachelor of Science in Computer Science',
    'Bachelor of Business Administration',
    'Bachelor of Arts in Education',
    'Bachelor of Science in Nursing',
    'Bachelor of Science in Agriculture',
  ],
  graduate: [
    'Master of Business Administration',
    'Master of Education',
    'Master of Science in Information Technology',
    'Master of Arts in Counseling Psychology',
    'Master of Public Health',
  ],
  phd: [
    'PhD in Computer Science',
    'PhD in Business Administration',
    'PhD in Education',
    'PhD in Public Health',
  ],
};

const NewApplication = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedType, setSelectedType] = useState<ProgramType>('undergraduate');
  const [selectedProgram, setSelectedProgram] = useState<string>('');

  const createMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: (data) => {
      toast({
        title: t('application.created'),
        description: t('application.continueForm'),
      });
      navigate(`/applications/${data.id}/form`);
    },
    onError: (error) => {
      toast({
        title: t('error.title'),
        description: t('error.createApplication'),
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProgram) {
      toast({
        title: t('error.title'),
        description: t('error.selectProgram'),
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate({
      program: selectedProgram,
      programType: selectedType,
      status: 'draft',
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('application.startNew')}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('application.selectProgramType')}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedType}
              onValueChange={(value) => {
                setSelectedType(value as ProgramType);
                setSelectedProgram('');
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="undergraduate" id="undergraduate" />
                <Label htmlFor="undergraduate" className="cursor-pointer">
                  {t('application.undergraduate')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="graduate" id="graduate" />
                <Label htmlFor="graduate" className="cursor-pointer">
                  {t('application.graduate')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phd" id="phd" />
                <Label htmlFor="phd" className="cursor-pointer">
                  {t('application.phd')}
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('application.selectProgram')}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedProgram}
              onValueChange={setSelectedProgram}
              className="grid grid-cols-1 gap-3"
            >
              {programs[selectedType].map((program) => (
                <div 
                  key={program} 
                  className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 hover:bg-gray-50"
                >
                  <RadioGroupItem value={program} id={program} />
                  <Label htmlFor={program} className="cursor-pointer w-full">
                    {program}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={createMutation.isPending || !selectedProgram}
            className="w-full md:w-auto"
          >
            {createMutation.isPending ? t('common.loading') : t('application.continue')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewApplication;