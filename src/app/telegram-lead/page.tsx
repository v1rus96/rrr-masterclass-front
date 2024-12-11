'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        initDataUnsafe: {
          user?: {
            id?: number;
            username?: string;
            first_name?: string;
            last_name?: string;
            language_code?: string;
          };
        };
      };
    };
  }
}

export default function TelegramLeadForm() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phonenumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [telegramUser, setTelegramUser] = useState<{
    userid?: number;
    username?: string;
    languagecode?: string;
  } | null>(null);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      if (user) {
        setTelegramUser({
          userid: user.id,
          username: user.username,
          languagecode: user.language_code,
        });

        // Pre-fill form with Telegram user data
        setFormData(prev => ({
          ...prev,
          firstname: user.first_name || '',
          lastname: user.last_name || '',
        }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      if (!telegramUser?.userid) {
        throw new Error('Telegram user ID is required');
      }

      const response = await fetch('/api/telegram-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: telegramUser.userid,
          username: telegramUser.username,
          languagecode: telegramUser.languagecode,
          firstname: formData.firstname,
          lastname: formData.lastname,
          phonenumber: `+998${formData.phonenumber.replace(/\D/g, '')}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setMessage('Information submitted successfully!');
      setFormData({ firstname: '', lastname: '', phonenumber: '' });
    } catch (error: any) {
      setMessage(error.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phonenumber') {
      // Only allow digits and format the phone number
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 9) {
        // Format as: 90 123 45 67
        const formatted = digitsOnly
          .replace(/(\d{2})(?=\d)/, '$1 ')
          .replace(/(\d{3})(?=\d)/, '$1 ')
          .replace(/(\d{2})(?=\d)/, '$1 ');
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <Image
                src="/rrr-logo.png"
                alt="Company Logo"
                width={120}
                height={40}
                className="h-auto w-auto"
                priority
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Contact Information
            </h1>
            <p className="text-sm text-muted-foreground">
              Please fill in your details below
            </p>
          </div>

          <form id="lead-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                id="firstname"
                name="firstname"
                required
                value={formData.firstname}
                onChange={handleChange}
                placeholder="First Name"
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                id="lastname"
                name="lastname"
                required
                value={formData.lastname}
                onChange={handleChange}
                placeholder="Last Name"
              />
            </div>

            <div className="space-y-2">
              <div className="flex">
                <div className="flex items-center px-3 border rounded-l-md border-r-0 bg-muted text-muted-foreground">
                  +998
                </div>
                <Input
                  type="tel"
                  id="phonenumber"
                  name="phonenumber"
                  required
                  value={formData.phonenumber}
                  onChange={handleChange}
                  placeholder="90 123 45 67"
                  className="rounded-l-none"
                />
              </div>
            </div>

            {message && (
              <div className={`text-sm p-3 rounded-md ${
                message.includes('success')
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-red-50 text-red-600'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-background">
        <div className="container max-w-[400px] py-4 px-4">
          <Button
            type="submit"
            form="lead-form"
            disabled={isSubmitting}
            className="w-full h-12"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
}
