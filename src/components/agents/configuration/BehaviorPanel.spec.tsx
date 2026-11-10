import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BehaviorPanel } from './BehaviorPanel';
import { BehaviorSettings } from './types';

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('./AgentToggle', () => ({
  default: ({
    id,
    checked,
    onCheckedChange,
    disabled,
  }: {
    id: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      aria-label={id}
      aria-pressed={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
    />
  ),
}));

const settings: BehaviorSettings = {
  humanService: false,
  eliteSales: false,
  customerJourney: false,
  scopeGuard: false,
  leadPipelineManagement: false,
  transferToHuman: false,
  useEmojis: false,
  allowReminders: false,
  allowPipelineManipulation: false,
  allowContactEdit: false,
  allowManageLabels: false,
  allowProductSales: false,
  timezone: 'America/Sao_Paulo',
  sendAsReply: false,
};

describe('BehaviorPanel versioned skills', () => {
  it('shows the versioned human-service control disabled by default', () => {
    render(
      <BehaviorPanel
        behaviorSettings={settings}
        onBehaviorSettingsChange={vi.fn()}
        onShowTransferRulesModal={vi.fn()}
        onShowPipelineRulesModal={vi.fn()}
        onShowContactEditModal={vi.fn()}
      />
    );

    expect(screen.getByText('edit.configuration.behavior.humanService')).toBeTruthy();
    expect(screen.getByLabelText('human-service').getAttribute('aria-pressed')).toBe('false');
  });

  it('shows elite sales disabled by default and enables it through the behavior callback', () => {
    const onChange = vi.fn();
    render(
      <BehaviorPanel
        behaviorSettings={settings}
        onBehaviorSettingsChange={onChange}
        onShowTransferRulesModal={vi.fn()}
        onShowPipelineRulesModal={vi.fn()}
        onShowContactEditModal={vi.fn()}
      />
    );

    expect(screen.getByText('edit.configuration.behavior.eliteSales')).toBeTruthy();
    expect(screen.getByLabelText('elite-sales').getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(screen.getByLabelText('elite-sales'));
    expect(onChange).toHaveBeenCalledWith({ ...settings, eliteSales: true });
  });

  it('shows the full customer journey disabled by default and enables the bundle', () => {
    const onChange = vi.fn();
    render(
      <BehaviorPanel
        behaviorSettings={{ ...settings, humanService: false }}
        onBehaviorSettingsChange={onChange}
        onShowTransferRulesModal={vi.fn()}
        onShowPipelineRulesModal={vi.fn()}
        onShowContactEditModal={vi.fn()}
      />
    );

    expect(screen.getByText('edit.configuration.behavior.customerJourney')).toBeTruthy();
    expect(screen.getByLabelText('customer-journey').getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(screen.getByLabelText('customer-journey'));
    expect(onChange).toHaveBeenCalledWith({
      ...settings,
      customerJourney: true,
      humanService: false,
    });
  });

  it('shows human service and elite sales as included while the full journey is enabled', () => {
    render(
      <BehaviorPanel
        behaviorSettings={{
          ...settings,
          humanService: false,
          eliteSales: false,
          customerJourney: true,
        }}
        onBehaviorSettingsChange={vi.fn()}
        onShowTransferRulesModal={vi.fn()}
        onShowPipelineRulesModal={vi.fn()}
        onShowContactEditModal={vi.fn()}
      />
    );

    expect(screen.getByLabelText('human-service').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByLabelText('elite-sales').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByLabelText('human-service').hasAttribute('disabled')).toBe(true);
    expect(screen.getByLabelText('elite-sales').hasAttribute('disabled')).toBe(true);
  });

  it('shows scope and pipeline skills disabled by default', () => {
    render(
      <BehaviorPanel
        behaviorSettings={settings}
        onBehaviorSettingsChange={vi.fn()}
        onShowTransferRulesModal={vi.fn()}
        onShowPipelineRulesModal={vi.fn()}
        onShowContactEditModal={vi.fn()}
      />
    );

    expect(screen.getByLabelText('scope-guard').getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByLabelText('lead-pipeline-management').getAttribute('aria-pressed')).toBe('false');
  });

  it('persists the operator toggle through the behavior callback', () => {
    const onChange = vi.fn();
    render(
      <BehaviorPanel
        behaviorSettings={settings}
        onBehaviorSettingsChange={onChange}
        onShowTransferRulesModal={vi.fn()}
        onShowPipelineRulesModal={vi.fn()}
        onShowContactEditModal={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('human-service'));
    expect(onChange).toHaveBeenCalledWith({ ...settings, humanService: true });
  });
});
