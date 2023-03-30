import type {Image} from './Image';
import type {HeaderText} from './HeaderText';
import type {ParagraphText} from './ParagraphText';
import type {Link} from './Link';
import type {StringValue} from './StringValue';
import type {DocumentsList} from './DocumentsList';
import type {Icon} from './Icon';
import type {TagsList} from './TagsList';

export type AnyFieldType = 'Image'
    | 'HeaderText'
    | 'ParagraphText'
    | 'Link'
    | 'StringValue'
    | 'DocumentsList'
    | 'Icon'
    | 'TagsList';

export type AnyField = Image
    | HeaderText
    | ParagraphText
    | Link
    | StringValue
    | DocumentsList
    | Icon
    | TagsList;

export {
    Image,
    HeaderText,
    ParagraphText,
    Link,
    StringValue,
    DocumentsList,
    Icon,
    TagsList
}
