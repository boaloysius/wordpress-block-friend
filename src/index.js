import { registerBlockType } from '@wordpress/blocks';
import './team-member'
import './style.scss';
import edit from './edit';
import save from './save';

registerBlockType('team/team-members', {
	edit,
	save,
});
