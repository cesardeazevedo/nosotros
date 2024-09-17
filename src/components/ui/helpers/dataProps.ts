type IData = Record<string, string | boolean | undefined>
type IDataProps<TKey extends string> = Record<`data-${TKey}`, string | boolean>

export const dataProps = (data: IData | undefined): IDataProps<keyof IData> | undefined =>
  data
    ? Object.keys(data).reduce(
        (acc, key) => {
          const value = data[key]

          return value
            ? {
                ...acc,
                [`data-${key}`]: value,
              }
            : acc
        },
        {} as IDataProps<keyof IData>,
      )
    : undefined
