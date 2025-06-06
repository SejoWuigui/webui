import { CdkDragHandle } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy, Component, computed, input, output,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { IxIconComponent } from 'app/modules/ix-icon/ix-icon.component';
import { TestDirective } from 'app/modules/test-id/test.directive';

@Component({
  selector: 'ix-widget-group-controls',
  templateUrl: './widget-group-controls.component.html',
  styleUrls: ['./widget-group-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconButton,
    TestDirective,
    IxIconComponent,
    TranslateModule,
    CdkDragHandle,
  ],
})
export class WidgetGroupControlsComponent {
  readonly index = input.required<number>();
  readonly totalGroups = input.required<number>();

  readonly moveUp = output();
  readonly moveDown = output();
  readonly edit = output();
  readonly delete = output();

  protected readonly canMoveUp = computed(() => this.index() > 0);
  protected readonly canMoveDown = computed(() => this.index() < this.totalGroups() - 1);
}
