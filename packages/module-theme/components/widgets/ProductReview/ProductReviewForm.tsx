import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { isValidArray } from '@utils/Helper';
import CreateProductReview from '@voguish/module-catalog/graphql/CreateProductReview.graphql';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { RightIcon } from '../../elements/Icon';
import ErrorBoundary from '../../ErrorBoundary';
import Modal from '../../Modal';
import { useToast } from '../../toast/hooks';
import { ButtonMui } from '../../ui/ButtonMui';
import InputField from '../../ui/Form/Elements/Input';
import { ReviewRating } from '../../ui/ReviewRating';
import { useCustomerMutation } from '@packages/module-customer/hooks/useCustomerMutation';

export interface PropReviewFormData {
  ratingsFields?: [] | object | any;
  openForm?: any;
  open?: boolean | any;
  productName?: string;
  sku?: string;
}
export const ProductReviewForm = (props: PropReviewFormData) => {
  const { t } = useTranslation('common');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [ratingValue, setRatingValue] = useState<number | null>(0);
  const [ratingError, setRatingError] = useState<string>('');
  const { showToast } = useToast();
  const [addReview, { loading }] = useCustomerMutation(CreateProductReview);
  /**
   * Form Submit Handler
   */
  const submitHandler = (data: [] | object | any) => {
    // Validate rating
    if (!ratingValue || ratingValue === 0) {
      setRatingError(t('Please provide a rating'));
      return;
    }
    const ratingsFields: RatingFieldProp = props?.ratingsFields;
    let formData: any = {};
    for (const item in data) {
      if (item.includes('ratings__')) {
        const key: any | [] = item?.split('ratings__');
        const values: any | [] | object = ratingsFields?.find(
          (field) => field.id == key[1]
        );
        const keys: any | [] | object = values?.values?.find(
          (value: RatingProp) => value.value == ratingValue
        );
        if (isValidArray(formData['ratings'])) {
          formData['ratings'] = [
            ...formData['ratings'],
            { id: key[1], value_id: keys?.value_id },
          ];
        } else {
          formData['ratings'] = [{ id: key[1], value_id: keys?.value_id }];
        }
      } else {
        formData[item] = data[item];
      }
    }

    addReview({
      variables: {
        input: formData,
      },
    })
      .then(() => {
        showToast({
          type: 'success',
          message: t('Review created successfully'),
        });
      })
      .catch((err) => {
        showToast({ message: err.message, type: 'error' });
      })
      .finally(() => {
        reset();
        setRatingValue(0);
        setRatingError('');
        setTimeout(() => props.openForm(), 1000);
      });
  };

  return (
    <ErrorBoundary>
      <Modal
        showModal={props.open}
        hideModal={props.openForm}
        title={
          <ErrorBoundary>
            <span
              className="flex cursor-pointer sm:hidden"
              onClick={() => {
                props.openForm();
              }}
            >
              <RightIcon />
            </span>{' '}
            {t('Add Your Review')}
          </ErrorBoundary>
        }
      >
        <form
          className="h-full mt-4 -sm:mb-4 -sm:px-6"
          onSubmit={handleSubmit(submitHandler)}
        >
          <FormGroup className="grid content-between" sx={{ mt: 1 }}>
            <div>
              <input type="hidden" {...register('sku', { value: props.sku })} />
              <div className="grid">
                <label htmlFor="ratings__NA==" className="mt-2">
                  {t('Rating')}
                </label>
                <input
                  type="hidden"
                  {...register('ratings__NA==', { value: ratingValue })}
                />
                <ReviewRating
                  Ratingvalue={ratingValue ?? 0}
                  setRatingvalue={(value) => {
                    setRatingValue(value);
                    if (value && value > 0) {
                      setRatingError('');
                    }
                  }}
                />
                {ratingError && (
                  <span className="text-red-600 text-sm mt-1">
                    {ratingError}
                  </span>
                )}
              </div>
              <InputField
                label={t('Name')}
                {...register('nickname', {
                  required: t('*Please provide your name'),
                })}
                type="text"
                className="mb-2"
                placeHolder={t('Enter your name')}
                error={errors?.nickname?.message ? true : false}
                helperText={errors?.nickname ? errors?.nickname?.message : ''}
              />

              <InputField
                label={t('Feedback Summary')}
                placeHolder={t('Write a summary')}
                type="text"
                className="mb-2"
                error={errors?.summary?.message ? true : false}
                helperText={errors?.summary ? errors?.summary?.message : ''}
                {...register('summary', {
                  required: t('*Please provide your heading for review'),
                })}
              />
              <div className="grid">
                <label className="pb-1 text-[1rem]" htmlFor="text">
                  {t('Feedback')}
                </label>
                <TextField
                  multiline
                  rows={2}
                  placeholder={t('Review Description')}
                  type="text"
                  error={errors?.text ? true : false}
                  {...register('text')}
                />
              </div>
            </div>
            <Grid className="flex items-center justify-end gap-6 sm:pt-6 -sm:mt-8">
              <Button
                className="xl:w-40 hidden sm:flex lg:w-40 md:w-40 w-32 mr-5 xl:float-right lg:float-right md:float-right float-left rounded-[unset] text-darkGreyBackground border  border-solid border-darkGreyBackground hover:bg-darkBackground hover:border-darkBackground hover:text-white "
                variant="outlined"
                onClick={props.openForm}
              >
                {t('Cancel')}
              </Button>
              <ButtonMui
                type="submit"
                className="float-right mr-0 w-full rounded-[unset] pl-0 pr-0 text-center sm:w-32 md:w-40 lg:w-40 xl:w-40"
                variant="contained"
                isLoading={loading}
              >
                {t('Submit')}
              </ButtonMui>
            </Grid>
          </FormGroup>
        </form>
      </Modal>
    </ErrorBoundary>
  );
};

interface RatingProp {
  value_id: string | number;
  value: string | number;
  map: [] | object | any;
}
interface RatingFieldProp {
  find(arg0: (field: any) => boolean): any;
  id?: string | number;
  values?: RatingProp;
  name?: string | number;
}
