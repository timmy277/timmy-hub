'use client';

import { useState, memo, ChangeEvent } from 'react';
import { TextInput, ActionIcon } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';

interface SearchInputProps {
    placeholder: string;
    onSearch: (val: string) => void;
    baseId: string;
}

export const SearchInput = memo(function SearchInput({
    placeholder,
    onSearch,
    baseId,
}: SearchInputProps) {
    const [value, setValue] = useState('');

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const val = event.currentTarget.value;
        setValue(val);
        onSearch(val);
    };

    const handleClear = () => {
        setValue('');
        onSearch('');
    };

    return (
        <TextInput
            id={`${baseId}-search`}
            placeholder={placeholder}
            leftSection={<IconSearch size={16} stroke={1.5} />}
            rightSection={
                value ? (
                    <ActionIcon variant="transparent" c="dimmed" onClick={handleClear}>
                        <IconX size={14} />
                    </ActionIcon>
                ) : null
            }
            value={value}
            onChange={handleChange}
            w={350}
            radius="md"
            variant="filled"
        />
    );
});
