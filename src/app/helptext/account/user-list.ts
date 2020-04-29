import { T } from '../../translate-marker';

export default {
user_list_actions_edit_label: T("Edit"),
user_list_actions_edit_id: "edit",
user_list_actions_delete_label: T("Delete"),
user_list_dialog_label: T("Delete"), 
user_list_dialog_message: T('Keep user primary group'),

builtins_dialog: {
    title: T(' Builtin Users'),
    message: T(' builtin users (default setting is <i>hidden</i>).'),
    show: T('Show'),
    hide: T('Hide')
},
builtinMessageDialog: {
    title: T('Display Note'),
    message: T('By default, all builtin users except <i>root</i> are \
 hidden by default. Use the gear icon (top-right) to toggle the display of builtin users.'),
    button: T('Close')
},
globalConfigTooltip: T('Toggle builtin users')

}