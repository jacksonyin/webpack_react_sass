import * as React from 'react';
import './App.scss';
import { ExpandableItemList } from './ExpandableItemList';

export type IAppProps = Record<string, unknown>;

type IAppState = {
  value?: string;
  items: string[];
};

export class App extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);

    this.state = {
      value: '',
      items: [
        'React',
        'TypeScript',
        'Webpack',
        'SCSS',
        'JavaScript',
        'HTML',
        'CSS',
        'Node.js',
        'Express',
        'MongoDB',
        'PostgreSQL',
        'Redis',
        'Docker',
        'Kubernetes',
        'AWS',
        'Azure',
        'Git',
        'GitHub',
        'CI/CD',
        'Testing',
        'Jest',
        'Cypress',
        'Storybook',
        'ESLint',
        'Prettier'
      ]
    };
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    this.setState(() => ({ value }));
  };

  render() {
    const { value, items } = this.state;
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="img-container">Test React</div>
        <input
          type="text"
          value={value}
          onChange={this.handleChange}
          placeholder="输入搜索内容..."
          style={{ 
            width: '100%', 
            padding: '8px', 
            margin: '20px 0',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        
        <div style={{ margin: '20px 0' }}>
          <h3>技术栈列表：</h3>
          <ExpandableItemList items={items} />
        </div>
        
        <div style={{ margin: '20px 0' }}>
          <h3>短列表测试：</h3>
          <ExpandableItemList items={['React', 'TypeScript', 'Webpack']} />
        </div>
      </div>
    );
  }
}
