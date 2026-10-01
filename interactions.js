const flows = {
  bnpl: { name: 'Buy now, pay later', steps: [
    ['Customer onboarding', 'Establish the customer and merchant context before entering the financing journey.'],
    ['Order & installment plan', 'Process the order and organize the repayment schedule around the installment program.'],
    ['Payment collection', 'Connect payment services and recurring collections to the installment lifecycle.'],
    ['Settlement & reconciliation', 'Bring payment records, refunds, and settlement workflows together.']
  ] },
  subscription: { name: 'Recurring payment lifecycle', steps: [
    ['Schedule billing', 'Prepare billing records and recurring jobs for the subscription cycle.'],
    ['Check payment status', 'Check the payment processor for an existing paid transaction before continuing the workflow.'],
    ['Collect & handle retries', 'Coordinate tokenized payment collection and billing retry selection.'],
    ['Synchronize the outcome', 'Update payment state and communicate the outcome to the connected platform.']
  ] },
  remittance: { name: 'Remittance orchestration', steps: [
    ['Sender & beneficiary', 'Process the sender and beneficiary information for the transfer journey.'],
    ['Validation integrations', 'Coordinate AML and fraud-validation integrations as part of the workflow.'],
    ['Transaction orchestration', 'Manage transaction state and asynchronous events between services.'],
    ['Customer notification', 'Connect transaction events to customer notification flows.']
  ] }
};
let selected = 'bnpl', step = 0, timer = null;
const stepsEl = document.getElementById('workflow-steps');
const play = document.getElementById('play-flow');
function render() {
  const flow = flows[selected];
  document.getElementById('workflow-name').textContent = flow.name;
  stepsEl.replaceChildren(...flow.steps.map(([title], index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'workflow-node' + (index === step ? ' active' : '') + (index < step ? ' complete' : '');
    button.setAttribute('aria-pressed', String(index === step));
    const number = document.createElement('span'); number.className = 'node-number'; number.textContent = String(index + 1).padStart(2, '0');
    const label = document.createElement('span'); label.textContent = title;
    button.append(number, label);
    button.addEventListener('click', () => { stop(); step = index; render(); stepsEl.children[index].focus(); });
    return button;
  }));
  document.getElementById('step-counter').textContent = `STEP ${step + 1} OF ${flow.steps.length}`;
  document.getElementById('step-title').textContent = flow.steps[step][0];
  document.getElementById('step-description').textContent = flow.steps[step][1];
}
function stop() { clearInterval(timer); timer = null; play.textContent = 'Play workflow'; }
document.querySelectorAll('[data-flow]').forEach(button => button.addEventListener('click', () => {
  stop(); selected = button.dataset.flow; step = 0;
  document.querySelectorAll('[data-flow]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  render();
}));
play.addEventListener('click', () => {
  if (timer) return stop();
  play.textContent = 'Pause workflow';
  timer = setInterval(() => { step = (step + 1) % flows[selected].steps.length; render(); }, 2400);
});
document.getElementById('next-step').addEventListener('click', () => { stop(); step = (step + 1) % flows[selected].steps.length; render(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
render();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.section-heading, .project-card, .services article, .timeline article, .healthcare').forEach(el => { el.classList.add('reveal'); observer.observe(el); });
}
const journeys = {
 payment: {nodes:['channels','core','payments','events'], title:'Connect the request to the outcome.', label:'PAYMENT ORCHESTRATION', description:'A customer request reaches business orchestration, integrates with payment services, and feeds downstream reconciliation and notification workflows.'},
 recurring: {nodes:['subscriptions','core','payments','events'], title:'Keep recurring collections in sync.', label:'RECURRING COLLECTIONS', description:'Subscription schedules initiate collection workflows. Payment-status checks and processor integrations help align confirmed outcomes with connected financial services.'},
 transfer: {nodes:['channels','identity','core','events'], title:'Orchestrate the transfer journey.', label:'REMITTANCE', description:'Sender and beneficiary processing connects with AML and fraud-validation integrations, transaction-state management, asynchronous events, and customer notifications.'}
};
const serviceDescriptions = {
 channels:['Customer channels','Connecting customer and partner requests to backend business workflows through REST APIs.'],
 identity:['Identity & validation','Experience with Keycloak permissions and reporting, access controls, and AML and fraud-validation integrations.'],
 lending:['Lending services','BNPL and single-payment financing: onboarding, orders, installment programs, collections, refunds, and settlements.'],
 core:['Service orchestration','Connecting domain workflows with Clean Architecture, CQRS, MediatR, REST integrations, webhooks, and asynchronous messages.'],
 payments:['Payment services','Integrating transaction processing, card enrollment, tokenization, and payment-status checks across financial platforms.'],
 subscriptions:['Subscription engine','Recurring schedules, billing jobs, payment collection, retry selection, and payment-state synchronization.'],
 events:['Downstream services','Connecting payment outcomes to reconciliation, settlement processes, and notifications using service integrations and asynchronous workflows.']
};
function selectJourney(key) {
 const journey=journeys[key];
 document.querySelectorAll('[data-journey]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.journey===key)));
 document.querySelectorAll('[data-service]').forEach(el=>{el.classList.toggle('lit',journey.nodes.includes(el.dataset.service));el.setAttribute('aria-pressed','false');});
 document.querySelectorAll('[data-wire]').forEach(el=>el.classList.toggle('lit',journey.nodes.includes(el.dataset.wire)));
 document.getElementById('network-kicker').textContent=journey.label;
 document.getElementById('network-title').textContent=journey.title;
 document.getElementById('network-description').textContent=journey.description;
}
 document.querySelectorAll('[data-journey]').forEach(el=>el.addEventListener('click',()=>selectJourney(el.dataset.journey)));
 document.querySelectorAll('[data-service]').forEach(el=>el.addEventListener('click',()=>{
 document.querySelectorAll('[data-service]').forEach(node=>node.setAttribute('aria-pressed',String(node===el)));
 const [title,description]=serviceDescriptions[el.dataset.service];
 document.getElementById('network-kicker').textContent='MY ENGINEERING EXPERIENCE';
 document.getElementById('network-title').textContent=title;
 document.getElementById('network-description').textContent=description;
 }));
const motionButton=document.getElementById('network-motion');
let networkPaused=reducedMotion.matches;
function applyMotion(){document.querySelector('.network-panel').classList.toggle('network-paused',networkPaused);motionButton.textContent=networkPaused?'Resume motion':'Pause motion';motionButton.setAttribute('aria-pressed',String(!networkPaused));}
motionButton.addEventListener('click',()=>{networkPaused=!networkPaused;applyMotion();});
reducedMotion.addEventListener('change',()=>{networkPaused=reducedMotion.matches;applyMotion();});
selectJourney('payment');applyMotion();
