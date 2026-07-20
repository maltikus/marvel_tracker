import { useStore } from '../store/store';
import { toast } from '../hooks/useToast';

export function exportProgress() {
  const { progress, settings } = useStore.getState();
  const blob = new Blob([JSON.stringify({ version: 1, progress, settings }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mcu-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Progress exported', 'success');
}

export function importProgressFromFile(file: File) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (!data.progress || typeof data.progress !== 'object') {
        throw new Error('Missing progress');
      }
      useStore.getState().importState({ progress: data.progress, settings: data.settings });
      toast('Progress imported', 'success');
    } catch (e) {
      toast(`Import failed: ${(e as Error).message}`, 'error');
    }
  };
  reader.onerror = () => toast('Could not read file', 'error');
  reader.readAsText(file);
}
