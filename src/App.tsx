import React, { useState, useEffect } from 'react';
import { ScreenId, ApiSettings, Conversation, SupportedLanguage } from './types';
import {
  getStoredSettings,
  saveSettings,
  getStoredConversations,
  saveConversations,
} from './services/storage';
import { downloadAndroidProjectZip } from './services/exportZip';
import { PhoneFrame } from './components/PhoneFrame';
import { CodeExplorerModal } from './components/CodeExplorerModal';
import { ActionConfirmModal } from './components/ActionConfirmModal';

// All 18 Screen components
import { SplashScreen } from './screens/SplashScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ChatScreen } from './screens/ChatScreen';
import { VoiceScreen } from './screens/VoiceScreen';
import { AppsScreen } from './screens/AppsScreen';
import { DeviceScreen } from './screens/DeviceScreen';
import { DownloadsScreen } from './screens/DownloadsScreen';
import { AppActivityScreen } from './screens/AppActivityScreen';
import { AppUsageScreen } from './screens/AppUsageScreen';
import { NotificationScreen } from './screens/NotificationScreen';
import { NotesScreen } from './screens/NotesScreen';
import { RemindersScreen } from './screens/RemindersScreen';
import { MemoryScreen } from './screens/MemoryScreen';
import { ApiConfigScreen } from './screens/ApiConfigScreen';
import { PermissionsScreen } from './screens/PermissionsScreen';
import { PrivacySecurityScreen } from './screens/PrivacySecurityScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AboutScreen } from './screens/AboutScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('splash');
  const [settings, setSettings] = useState<ApiSettings>(getStoredSettings());
  const [conversations, setConversations] = useState<Conversation[]>(getStoredConversations());
  const [activeConvId, setActiveConvId] = useState<string>(
    conversations[0]?.id || 'default-conv'
  );

  const [isCodeExplorerOpen, setIsCodeExplorerOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    targetItem?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const activeConversation =
    conversations.find((c) => c.id === activeConvId) ||
    conversations[0] || {
      id: 'default-conv',
      title: 'Welcome to AURITH',
      createdAt: Date.now(),
      messages: [],
    };

  const handleUpdateConversation = (updated: Conversation) => {
    const newConvs = conversations.map((c) => (c.id === updated.id ? updated : c));
    setConversations(newConvs);
    saveConversations(newConvs);
  };

  const handleNewChat = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: `Conversation ${conversations.length + 1}`,
      createdAt: Date.now(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'aurith',
          text: 'Namaste! Main AURITH hoon. How can I assist you with your phone or questions right now?',
          timestamp: Date.now(),
        },
      ],
    };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    saveConversations(updated);
    setActiveConvId(newConv.id);
    setCurrentScreen('chat');
  };

  const handleUpdateLanguage = (lang: SupportedLanguage) => {
    const updated = { ...settings, selectedLanguage: lang };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleRequestConfirmAction = (details: any) => {
    setConfirmModal({
      isOpen: true,
      title: `Authorize Action: ${details.action}`,
      description: `AURITH requires explicit confirmation before proceeding with sensitive phone operations.`,
      targetItem: details.target,
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        alert(`Authorized: ${details.action} on ${details.target || 'target'}`);
      },
    });
  };

  return (
    <>
      <PhoneFrame
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenCodeExplorer={() => setIsCodeExplorerOpen(true)}
        onDownloadZip={downloadAndroidProjectZip}
      >
        {currentScreen === 'splash' && (
          <SplashScreen onFinish={() => setCurrentScreen('home')} />
        )}

        {currentScreen === 'home' && (
          <HomeScreen
            onNavigate={setCurrentScreen}
            openRouterConfigured={!!settings.openRouterApiKey}
            fishAudioConfigured={settings.ttsEngine === 'lifetime_free_device' || settings.ttsEngine === 'lifetime_free_google' || !!settings.fishAudioApiKey}
          />
        )}

        {currentScreen === 'chat' && (
          <ChatScreen
            conversation={activeConversation}
            onUpdateConversation={handleUpdateConversation}
            onNewChat={handleNewChat}
            onNavigate={setCurrentScreen}
            settings={settings}
            onRequestConfirmAction={handleRequestConfirmAction}
          />
        )}

        {currentScreen === 'voice' && (
          <VoiceScreen
            onNavigate={setCurrentScreen}
            settings={settings}
            onUpdateLanguage={handleUpdateLanguage}
            onRequestConfirmAction={handleRequestConfirmAction}
          />
        )}

        {currentScreen === 'apps' && (
          <AppsScreen onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'device' && (
          <DeviceScreen onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'downloads' && (
          <DownloadsScreen
            onNavigate={setCurrentScreen}
            onRequestConfirmAction={handleRequestConfirmAction}
          />
        )}

        {currentScreen === 'app_activity' && (
          <AppActivityScreen onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'app_usage' && (
          <AppUsageScreen onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'notifications' && (
          <NotificationScreen onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'notes' && (
          <NotesScreen onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'reminders' && (
          <RemindersScreen onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'memory' && (
          <MemoryScreen
            onNavigate={setCurrentScreen}
            settings={settings}
            onUpdateSettings={setSettings}
          />
        )}

        {currentScreen === 'api_config' && (
          <ApiConfigScreen
            onNavigate={setCurrentScreen}
            settings={settings}
            onUpdateSettings={setSettings}
          />
        )}

        {currentScreen === 'permissions' && (
          <PermissionsScreen onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'privacy_security' && (
          <PrivacySecurityScreen onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            onNavigate={setCurrentScreen}
            settings={settings}
            onUpdateSettings={setSettings}
            onOpenCodeExplorer={() => setIsCodeExplorerOpen(true)}
          />
        )}

        {currentScreen === 'about' && (
          <AboutScreen
            onNavigate={setCurrentScreen}
            onOpenCodeExplorer={() => setIsCodeExplorerOpen(true)}
          />
        )}
      </PhoneFrame>

      {/* Code Explorer Modal */}
      <CodeExplorerModal
        isOpen={isCodeExplorerOpen}
        onClose={() => setIsCodeExplorerOpen(false)}
      />

      {/* Sensitive Action Confirmation Modal */}
      <ActionConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        targetItem={confirmModal.targetItem}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
