import React, { useState } from 'react';
import { Button, Card } from '../ui';

interface ConfigSaveFormProps {
  onSave: (name: string) => void;
  onCancel: () => void;
}

/**
 * Form for saving a new configuration
 */
export default function ConfigSaveForm({ onSave, onCancel }: ConfigSaveFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      setName('');
    }
  };

  return (
    <Card variant="bordered" padding="md">
      <h3 className="text-white font-semibold mb-3">Save Configuration</h3>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter configuration name"
          className="flex-1 px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:outline-none focus:border-blue-500"
          autoFocus
        />
        <Button type="submit" variant="success">
          Save
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </form>
    </Card>
  );
}
