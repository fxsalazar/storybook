import React, { ComponentType, FunctionComponent, MouseEvent, useState } from 'react';
import { styled } from '@storybook/theming';
import { document, window } from 'global';
import memoize from 'memoizerific';
import { SyntaxHighlighterProps as ReactSyntaxHighlighterProps } from 'react-syntax-highlighter';

import { ActionBar } from '../ActionBar/ActionBar';
import { ScrollArea } from '../ScrollArea/ScrollArea';

import { formatter } from './formatter';

const ReactSyntaxHighlighter: ComponentType<ReactSyntaxHighlighterProps> & {
  registerLanguage: (name: string, func: any) => void;
} = require('react-syntax-highlighter/dist/cjs/prism-light').default;

ReactSyntaxHighlighter.registerLanguage(
  'jsx',
  require('react-syntax-highlighter/dist/cjs/languages/prism/jsx').default
);
ReactSyntaxHighlighter.registerLanguage(
  'bash',
  require('react-syntax-highlighter/dist/cjs/languages/prism/bash').default
);
ReactSyntaxHighlighter.registerLanguage(
  'css',
  require('react-syntax-highlighter/dist/cjs/languages/prism/css').default
);
ReactSyntaxHighlighter.registerLanguage(
  'html',
  require('react-syntax-highlighter/dist/cjs/languages/prism/markup').default
);
ReactSyntaxHighlighter.registerLanguage(
  'tsx',
  require('react-syntax-highlighter/dist/cjs/languages/prism/tsx').default
);
ReactSyntaxHighlighter.registerLanguage(
  'typescript',
  require('react-syntax-highlighter/dist/cjs/languages/prism/typescript').default
);

const themedSyntax = memoize(2)(theme =>
  Object.entries(theme.code || {}).reduce((acc, [key, val]) => ({ ...acc, [`* .${key}`]: val }), {})
);

export interface WrapperProps {
  bordered?: boolean;
  padded?: boolean;
}

const Wrapper = styled.div<WrapperProps>(
  ({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    color: theme.color.defaultText,
  }),
  ({ theme, bordered }) =>
    bordered
      ? {
          border: `1px solid ${theme.appBorderColor}`,
          borderRadius: theme.borderRadius,
          background: theme.background.content,
        }
      : {}
);

const Scroller = styled(({ children, className }) => (
  <ScrollArea horizontal vertical className={className}>
    {children}
  </ScrollArea>
))(
  {
    position: 'relative',
  },
  ({ theme }) => ({
    '& code': {
      paddingRight: theme.layoutMargin,
    },
  }),
  ({ theme }) => themedSyntax(theme)
);

export interface PreProps {
  padded?: boolean;
}

const Pre = styled.pre<PreProps>(({ theme, padded }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  margin: 0,
  padding: padded ? theme.layoutMargin : 0,
}));

const Code = styled.code({
  flex: 1,
  paddingRight: 0,
  opacity: 1,
});

export interface SyntaxHighlighterProps {
  language: string;
  copyable?: boolean;
  bordered?: boolean;
  padded?: boolean;
  format?: boolean;
  className?: string;
}

export interface SyntaxHighlighterState {
  copied: boolean;
}

type Props = SyntaxHighlighterProps & ReactSyntaxHighlighterProps;
export const SyntaxHighlighter: FunctionComponent<Props> = ({
  children,
  language = 'jsx',
  copyable = false,
  bordered = false,
  padded = false,
  format = true,
  className = null,
  ...rest
}) => {
  const [copied, setCopied] = useState(false);

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const tmp = document.createElement('TEXTAREA');
    const focus = document.activeElement;

    tmp.value = children;

    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
    focus.focus();

    setCopied(true);

    window.setTimeout(() => setCopied(false), 1500);
  };

  return children ? (
    <Wrapper bordered={bordered} padded={padded} className={className}>
      <Scroller>
        <ReactSyntaxHighlighter
          padded={padded || bordered}
          language={language}
          useInlineStyles={false}
          PreTag={Pre}
          CodeTag={Code}
          lineNumberContainerStyle={{}}
          {...rest}
        >
          {format ? formatter((children as string).trim()) : (children as string).trim()}
        </ReactSyntaxHighlighter>
      </Scroller>

      {copyable ? (
        <ActionBar actionItems={[{ title: copied ? 'Copied' : 'Copy', onClick }]} />
      ) : null}
    </Wrapper>
  ) : null;
};
