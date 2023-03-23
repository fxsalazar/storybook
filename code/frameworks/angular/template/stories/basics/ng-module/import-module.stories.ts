import { StoryFn, Meta, moduleMetadata } from '@storybook/angular';
import { ChipsModule } from './angular-src/chips.module';
import { ChipsGroupComponent } from './angular-src/chips-group.component';
import { CHIP_COLOR } from './angular-src/chip-color.token';

export default {
  // title: 'Basics / NgModule / Module with multiple component',
  component: ChipsGroupComponent,
  decorators: [
    moduleMetadata({
      imports: [ChipsModule],
      providers: [
        {
          provide: CHIP_COLOR,
          useValue: '#eeeeee',
        },
      ],
    }),
  ],
} as Meta;

export const ChipsGroup: StoryFn = (args) => ({
  props: args,
});

ChipsGroup.args = {
  chips: [
    {
      id: 1,
      text: 'Chip 1',
    },
    {
      id: 2,
      text: 'Chip 2',
    },
  ],
};

ChipsGroup.argTypes = {
  removeChipClick: { action: 'Remove chip' },
  removeAllChipsClick: { action: 'Remove all chips clicked' },
};
