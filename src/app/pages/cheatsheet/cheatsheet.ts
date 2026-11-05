import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  API_ITEMS,
  CHEAT_SECTIONS,
  CLI_COMMANDS,
  LIFECYCLE_ROWS,
  RXJS_OPERATORS,
} from '../../core/content/cheatsheet.content';
import { CheatRowView } from '../../shared/cheat-row/cheat-row';

@Component({
  selector: 'app-cheatsheet',
  imports: [RouterLink, CheatRowView],
  templateUrl: './cheatsheet.html',
  styleUrl: './cheatsheet.css',
})
export class CheatsheetPage {
  readonly query = signal('');
  readonly sections = CHEAT_SECTIONS;
  readonly apiItems = API_ITEMS;
  readonly cliCommands = CLI_COMMANDS;
  readonly lifecycleRows = LIFECYCLE_ROWS;
  readonly rxjsOperators = RXJS_OPERATORS;

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return CHEAT_SECTIONS;

    return CHEAT_SECTIONS.map((section) => ({
      ...section,
      rows: section.rows.filter((row) =>
        [row.topic, row.react, row.angular, row.note ?? '']
          .join(' ')
          .toLowerCase()
          .includes(q),
      ),
    })).filter((section) => section.rows.length > 0);
  });

  readonly rowCount = computed(() =>
    this.filtered().reduce((sum, section) => sum + section.rows.length, 0),
  );

  pad(index: number): string {
    return String(index).padStart(2, '0');
  }
}
