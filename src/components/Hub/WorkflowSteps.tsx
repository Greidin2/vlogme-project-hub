type WorkflowStepsProps = {
  steps: string[];
};

export function WorkflowSteps({ steps }: WorkflowStepsProps) {
  return (
    <ol className="hub-steps">
      {steps.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );
}
