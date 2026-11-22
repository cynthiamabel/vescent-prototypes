// Fictional records only. No catalog, licensing, sponsorship or approval service is connected.
export interface SampleResource {
  id: string;
  title: string;
  provider: string;
  format: 'Article' | 'Video';
  length: string;
  description: string;
  destination: string;
  sponsoredExample: boolean;
  tags: string[];
}
export const sampleResources: SampleResource[] = [
  {
    id: 'college-goal',
    title: 'Saving for college: start with one small goal',
    provider: 'Greenlight',
    format: 'Article',
    length: '4 min read',
    description: 'A conversation starter about college-saving goals, the questions teens have, and how to start talking about them.',
    destination: 'https://greenlight.example/learn/saving-for-college',
    sponsoredExample: true,
    tags: ['saving for college', 'goals', 'money'],
  },
  {
    id: 'small-steps',
    title: 'Big goals, small steps',
    provider: 'Sharpen',
    format: 'Video',
    length: '3 min',
    description: 'A short video about making a distant goal feel more approachable, with prompts to discuss saving for college.',
    destination: 'https://sharpen.example/videos/big-goals-small-steps',
    sponsoredExample: false,
    tags: ['saving for college', 'goals', 'confidence'],
  },
  {
    id: 'college-questions',
    title: 'College costs: questions worth asking',
    provider: 'Future Fund (fictional)',
    format: 'Article',
    length: '5 min read',
    description: 'Questions to bring to a conversation about college costs, goals, and asking for support.',
    destination: 'https://future-fund.example/college/questions',
    sponsoredExample: false,
    tags: ['saving for college', 'questions', 'money'],
  },
  {
    id: 'money-conversations',
    title: 'When talking about money feels awkward',
    provider: 'Sharpen',
    format: 'Video',
    length: '2 min',
    description: 'A short video about finding the words to ask for support when money feels awkward to discuss.',
    destination: 'https://sharpen.example/videos/money-conversations',
    sponsoredExample: false,
    tags: ['saving for college', 'conversation', 'support'],
  },
];
export const sampleResourceById = (id: string) => sampleResources.find(resource => resource.id === id);
export const samplePrefix = 'demo-resource:';
