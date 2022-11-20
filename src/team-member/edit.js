import {
	useBlockProps,
	RichText,
	MediaPlaceholder,
	BlockControls,
	MediaReplaceFlow,
	InspectorControls,
	store as BlockEditorStore,
} from '@wordpress/block-editor';
import { isBlobURL, revokeBlobURL } from '@wordpress/blob';
import { __ } from '@wordpress/i18n';
import {
	Spinner,
	ToolbarButton,
	PanelBody,
	TextareaControl,
	SelectControl,
	Icon,
	TextControl,
	Button,
} from '@wordpress/components';
import { useEffect, useState, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

export default function Edit({ attributes, setAttributes, isSelected }) {
	const { name, bio, url, alt, id, socialLinks } = attributes;
	const [blobURL, setBlobURL] = useState();

	const titleRef = useRef();
	const [selectedLink, setSelectedLink] = useState();

	const imageObject = useSelect(
		(select) => {
			const { getMedia } = select('core');
			return id ? getMedia(id) : null;
		},
		[id]
	);

	const imageSizes = useSelect((select) => {
		return select(BlockEditorStore).getSettings().imageSizes;
	}, []);

	const getImageSizeOptions = () => {
		if (!imageObject) return [];
		const options = [];
		const sizes = imageObject.media_details.sizes;
		for (const key in sizes) {
			const size = sizes[key];
			const imageSize = imageSizes.find((s) => s.slug == key);
			if (imageSize) {
				options.push({
					label: imageSize.name,
					value: size.source_url,
				});
			}
		}
		return options;
	};

	const onChangeName = (newName) => {
		setAttributes({ name: newName });
	};
	const onChangeBio = (newBio) => {
		setAttributes({ bio: newBio });
	};
	const onChangeAlt = (newAlt) => {
		setAttributes({ alt: newAlt });
	};

	const onChangeImageSize = (newURL) => {
		setAttributes({ url: newURL });
	};

	const onSelectImage = (img) => {
		setAttributes({ id: img.id, url: img.url, alt: img.alt });
	};
	const onSelectURL = (newURL) => {
		setAttributes({ id: undefined, url: newURL, alt: '' });
	};
	const removeImage = () => {
		setAttributes({ id: undefined, url: undefined, alt: '' });
	};

	const addNewSocialItem = () => {
		setAttributes({
			socialLinks: [...socialLinks, { icon: 'wordpress', link: '' }],
		});
		setSelectedLink(socialLinks.length);
	};

	const updateSocialItem = (type, value) => {
		const socialLinkCopy = [...socialLinks];
		socialLinkCopy[selectedLink][type] = value;
		setAttributes({ socialLinks: socialLinkCopy });
	};

	const removeSocialItem = () => {
		setAttributes({
			socialLinks: [
				...socialLinks.slice(0, selectedLink),
				...socialLinks.slice(selectedLink + 1),
			],
		});
		setSelectedLink();
	};

	useEffect(() => {
		if (!id && isBlobURL(url)) {
			setAttributes({ url: null, alt: '' });
		}
	}, []);

	useEffect(() => {
		if (isBlobURL(url)) {
			setBlobURL(url);
		} else {
			revokeBlobURL(blobURL);
			setBlobURL();
		}
	}, [url]);

	useEffect(() => {
		if (!titleRef.current.innerText) {
			titleRef.current.focus();
		}
	}, [url]);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Image Settings', 'team-members')}>
					{id && (
						<SelectControl
							label={__('Image Size', 'team-members')}
							options={getImageSizeOptions()}
							value={url}
							onChange={onChangeImageSize}
						/>
					)}

					{url && !isBlobURL(url) && (
						<TextareaControl
							label={__('Alt', 'team-members')}
							value={alt}
							onChange={onChangeAlt}
							help={__(
								'Alternate text to people who cannot see the image.',
								'team-members'
							)}
						/>
					)}
				</PanelBody>
			</InspectorControls>
			{url && (
				<BlockControls group="inline">
					<ToolbarButton onClick={removeImage}>
						{__('Remove Image', 'team-members')}
					</ToolbarButton>
					<MediaReplaceFlow
						name={__('Replace Image', 'team-members')}
						onSelect={onSelectImage}
						onSelectURL={onSelectURL}
						onSelectError={(err) => {}}
						accept="image/*"
						allowedTypes={['image']}
						mediaId={id}
						mediaURL={url}
					/>
				</BlockControls>
			)}
			<div {...useBlockProps()}>
				{url && (
					<div
						className={`wp-block-team-team-member-img${
							isBlobURL(url) ? ' is-loading' : ''
						}`}
					>
						<img src={url} alt={alt} />
						{isBlobURL(url) && <Spinner />}
					</div>
				)}
				<MediaPlaceholder
					icon="admin-users"
					onSelect={onSelectImage}
					onSelectURL={onSelectURL}
					onSelectError={(err) => {}}
					accept="image/*"
					allowedTypes={['image']}
					disableMediaButtons={url}
				/>
				<RichText
					ref={titleRef}
					placeholder={__('Member Name', 'team-member')}
					tagName="h4"
					onChange={onChangeName}
					value={name}
					allowedFormats={[]}
				/>
				<RichText
					placeholder={__('Member Bio', 'team-member')}
					tagName="p"
					onChange={onChangeBio}
					value={bio}
					allowedFormats={[]}
				/>
				<div className="wp-block-team-team-member-social-links">
					<ul>
						{socialLinks.map((item, index) => {
							return (
								<li
									key={index}
									className={
										selectedLink === index
											? 'is-selected'
											: null
									}
									data-icon={item.icon}
								>
									<button
										aria-label={__(
											'Edit Social Link',
											'team-members'
										)}
										onClick={() => {
											setSelectedLink(index);
										}}
									>
										<Icon icon={item.icon} />
									</button>
								</li>
							);
						})}
						{isSelected && (
							<li className="wp-block-team-team-member-add-icons">
								<button
									aria-label={__(
										'Add Social Link',
										'team-members'
									)}
								>
									<Icon
										onClick={addNewSocialItem}
										icon="plus"
									/>
								</button>
							</li>
						)}
					</ul>
				</div>
				{selectedLink != undefined && (
					<div className="wp-block-team-team-member-link-form">
						<TextControl
							label={__('Icon', 'text-members')}
							value={socialLinks[selectedLink].icon}
							onChange={(icon) => {
								updateSocialItem('icon', icon);
							}}
						/>
						<TextControl
							label={__('URL', 'text-members')}
							value={socialLinks[selectedLink].link}
							onChange={(link) => {
								updateSocialItem('link', link);
							}}
						/>
						<br />
						<Button isDestructive onClick={removeSocialItem}>
							{__('Remove Link', 'text-members')}
						</Button>
					</div>
				)}
			</div>
		</>
	);
}
