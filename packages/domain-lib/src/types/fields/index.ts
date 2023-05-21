import type {Image} from './Image';
import type {HeaderText} from './HeaderText';
import type {ParagraphText} from './ParagraphText';
import type {Link} from './Link';
import type {StringValue} from './StringValue';
import type {DocumentsList, DocumentsListSelectionMode} from './DocumentsList';
import type {Icon} from './Icon';

export type AnyFieldType = 'Image'
    | 'HeaderText'
    | 'ParagraphText'
    | 'Link'
    | 'StringValue'
    | 'DocumentsList'
    | 'Icon';

export type AnyField = Image
    | HeaderText
    | ParagraphText
    | Link
    | StringValue
    | DocumentsList
    | Icon;

export {
    Image,
    HeaderText,
    ParagraphText,
    Link,
    StringValue,
    DocumentsList,
    DocumentsListSelectionMode,
    Icon
}
